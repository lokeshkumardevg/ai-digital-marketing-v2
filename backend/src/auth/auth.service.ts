
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { GoogleAdsApi } from 'google-ads-api';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Auto-fix for new/existing users without permissions
    if (!user.permissions || user.permissions.length === 0) {
      user.permissions = ['*']; // Grant full access by default
      if (user.save) {
        await user.save();
      } else {
        await this.usersService.update(user._id || user.id, { permissions: ['*'] });
      }
    }

    const payload = { email: user.email, sub: user._id || user.id };
    const { passwordHash, ...userData } = user.toObject ? user.toObject() : user;
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        ...userData,
        id: user._id || user.id,
        permissions: user.permissions
      }
    };
  }

  async register(registerDto: any) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('User already registered in the ecosystem.');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(registerDto.password, salt);

    const created = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash: hash
    });

    return this.login(created);
  }

  async updateProfile(userId: string, updateDto: any) {
    const updated = await this.usersService.update(userId, updateDto);
    if (!updated) {
      throw new UnauthorizedException('User not found.');
    }
    const { passwordHash, ...result } = updated.toObject();
    return result;
  }

  // ================= GOOGLE =================

  async loginWithGoogleCode(code: string) {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Google credentials not configured');
    }

    // Step 1: Exchange code for tokens
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: 'postmessage', // required for auth-code flow from browser
      grant_type: 'authorization_code',
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokens = await tokenRes.json() as any;

    if (tokens.error) {
      console.error('[Google Login] Token exchange failed:', tokens);
      throw new UnauthorizedException(tokens.error_description || 'Google login failed');
    }

    // Step 2: Get user info
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userInfo = await userInfoRes.json() as any;

    if (!userInfo.email) {
      throw new UnauthorizedException('Could not get user info from Google');
    }

    // Step 3: Find or create user
    let user = await this.usersService.findByEmail(userInfo.email);

    if (!user) {
      const randomPass = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(randomPass, salt);
      user = await this.usersService.create({
        name: userInfo.name || userInfo.email.split('@')[0],
        email: userInfo.email,
        passwordHash: hash,
      });
    }

    // Step 4: Save tokens to DB so GoogleBusinessService can use them
    const updateData: any = {
      googleAccessToken: tokens.access_token,
      googleTokenExpiry: Date.now() + (tokens.expires_in || 3600) * 1000,
    };

    // refresh_token only comes on first login or when prompt=consent
    if (tokens.refresh_token) {
      updateData.googleRefreshToken = tokens.refresh_token;
      console.log('[Google Login] Refresh token saved ✓');
    } else {
      console.log('[Google Login] No refresh token in response (user already consented before)');
    }

    await this.usersService.update(user._id.toString(), updateData);

    return this.login(user);
  }

  // Kept as fallback — can remove later
  async loginWithGoogleIdToken(token: string) {
    let email = '';
    let name = '';

    try {
      const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!userInfoRes.data?.email) throw new Error('Invalid response');
      email = userInfoRes.data.email;
      name = userInfoRes.data.name || email.split('@')[0];
    } catch (err: any) {
      throw new UnauthorizedException('Invalid Google token');
    }

    let user = await this.usersService.findByEmail(email);
    if (!user) {
      const randomPass = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(randomPass, salt);
      user = await this.usersService.create({ name, email, passwordHash: hash });
    }
    return this.login(user);
  }

  async getGoogleAuthUrl(userId: string) {
    const user = await this.usersService.findById(userId);
    const clientId = user?.googleClientId || this.configService.get('GOOGLE_CLIENT_ID');

    if (!clientId) {
      throw new Error('Google Client ID not configured');
    }

    const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3000';
    const redirectUri = `${backendUrl}/auth/google/callback`;

    const scope = [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' ');

    return `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&state=${userId}`;
  }

  getMetaAuthUrl(userId: string) {
    const appId = this.configService.get('META_APP_ID');
    const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3000';
    const redirectUri = `${backendUrl}/auth/meta/callback`;
    const scope = [
      'public_profile',
      'email',
      'ads_management',
      'ads_read',
    ].join(',');

    return `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${userId}`;
  }

  getXAuthUrl(userId: string) {
    const clientId = this.configService.get('X_CLIENT_ID') || this.configService.get('TWITTER_CLIENT_ID');
    if (!clientId) {
      throw new Error('X (Twitter) Client ID not configured.');
    }
    const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3000';
    const redirectUri = `${backendUrl}/auth/x/callback`;
    // Use only basic scopes — ads.read requires special Twitter Ads API access
    const scope = encodeURIComponent('tweet.read users.read offline.access');
    const codeVerifier = 'challengechallengechallengechallengechallenge'; // 43 chars
    const crypto = require('crypto');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${userId}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  }


  getLinkedInAuthUrl(userId: string) {
    const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
    const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3000';
    const redirectUri = `${backendUrl}/auth/linkedin/callback`;
    const scope = 'openid%20profile%20email%20w_member_social%20r_organization_admin%20w_organization_social';

    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${userId}`;
  }

  async handleGoogleCallback(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const clientId = user.googleClientId || this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = user.googleClientSecret || this.configService.get('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Google credentials not configured');
    }

    const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3000';

    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${backendUrl}/auth/google/callback`,
      grant_type: 'authorization_code',
    });

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokens = await res.json();
    if (tokens.error) throw new UnauthorizedException(tokens.error_description);

    let customerId = user.googleCustomerId;

    try {
      if (tokens.refresh_token) {
        const devToken = this.configService.get<string>('GOOGLE_DEVELOPER_TOKEN') || 'lcZ3RRE00HWy2i4quLMNuQ';
        const client = new GoogleAdsApi({
          client_id: clientId,
          client_secret: clientSecret,
          developer_token: devToken,
        });

        const customerData = await client.listAccessibleCustomers(tokens.refresh_token);

        if (customerData.resource_names && customerData.resource_names.length > 0) {
          // Format is "customers/1234567890"
          customerId = customerData.resource_names[0].split('/')[1];
        }
      }
    } catch (e) {
      console.error('Failed to auto-fetch Google Ads customer ID via google-ads-api', e);
    }

    await this.usersService.update(userId, {
      googleRefreshToken: tokens.refresh_token,
      googleAccessToken: tokens.access_token,
      googleTokenExpiry: Date.now() + tokens.expires_in * 1000,
      ...(customerId && { googleCustomerId: customerId }),
    });

    return { success: true };
  }

  async getGoogleAccessToken(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const clientId = user.googleClientId || this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = user.googleClientSecret || this.configService.get('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Google credentials not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: params,
    });

    const data = await res.json();
    if (data.error) throw new UnauthorizedException(data.error);

    return data.access_token;
  }

  async getGoogleAdsInsights(userId: string, customerId: string) {
    const user = await this.usersService.findById(userId);

    if (!user?.googleRefreshToken) {
      throw new UnauthorizedException('Google not connected');
    }

    const accessToken = await this.getGoogleAccessToken(
      userId,
      user.googleRefreshToken
    );

    const developerToken =
      user.googleDeveloperToken ||
      this.configService.get('GOOGLE_DEVELOPER_TOKEN');

    if (!developerToken) {
      throw new UnauthorizedException('Google developer token not configured');
    }

    // ✅ CLEAN customer ID (remove dashes)
    const cleanCustomerId = customerId.replace(/-/g, '');

    const query = `
    SELECT
      campaign.id,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.ctr
    FROM campaign
    ORDER BY metrics.impressions DESC
    LIMIT 10
  `;

    const managerId = user.googleCustomerId ? user.googleCustomerId.replace(/-/g, '') : null;
    const loginCustomerId = (managerId && managerId !== cleanCustomerId) ? managerId : cleanCustomerId;

    const res = await fetch(
      `https://googleads.googleapis.com/v16/customers/${cleanCustomerId}/googleAds:search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',

          // ✅ VERY IMPORTANT (fix for many accounts)
          'login-customer-id': loginCustomerId,
        },
        body: JSON.stringify({ query }),
      },
    );

    const data = await res.json();

    if (data.error) {
      console.error('Google Ads Error:', data);
      throw new UnauthorizedException(
        data.error.message || 'Google Ads API failed',
      );
    }

    return data;
  }

  async checkGoogleAccounts(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.googleRefreshToken) {
      throw new UnauthorizedException('User not found or Google refresh token missing. Please connect Google first.');
    }

    try {
      const devToken = this.configService.get<string>('GOOGLE_DEVELOPER_TOKEN') || 'lcZ3RRE00HWy2i4quLMNuQ';
      const clientId = user.googleClientId || this.configService.get<string>('GOOGLE_CLIENT_ID');
      const clientSecret = user.googleClientSecret || this.configService.get<string>('GOOGLE_CLIENT_SECRET');

      const client = new GoogleAdsApi({
        client_id: clientId as string,
        client_secret: clientSecret as string,
        developer_token: devToken as string,
      });

      const customers = await client.listAccessibleCustomers(user.googleRefreshToken);
      console.log('Google Ads API Response (gRPC):', JSON.stringify(customers, null, 2));

      // Map resource_names back to resourceNames to maintain compatibility with existing frontend code
      const mappedData = {
        resourceNames: customers.resource_names || []
      };

      return {
        success: true,
        message: 'Successfully hit Google Ads API',
        data: mappedData
      };
    } catch (e: any) {
      console.error('Google Ads Fetch Error:', e);
      return {
        success: false,
        error: e.message || 'Failed to fetch'
      };
    }
  }

  // ================= META =================

  async handleMetaCallback(userId: string, code: string) {
    try {
      console.log('===== META CALLBACK START =====');
      console.log('USER ID:', userId);
      console.log('CODE:', code);

      const user = await this.usersService.findById(userId);

      if (!user) {
        console.log('USER NOT FOUND');
        throw new UnauthorizedException('User not found');
      }

      const appId =
        user.metaAppId || this.configService.get('META_APP_ID');

      const appSecret =
        user.metaAppSecret || this.configService.get('META_APP_SECRET');

      console.log('APP ID:', appId);
      console.log('APP SECRET EXISTS:', !!appSecret);

      const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3000';
      const redirectUri = `${backendUrl}/auth/meta/callback`;

      console.log('REDIRECT URI:', redirectUri);

      // ================= SHORT TOKEN =================

      const shortUrl =
        `https://graph.facebook.com/v20.0/oauth/access_token` +
        `?client_id=${appId}` +
        `&client_secret=${appSecret}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&code=${code}`;

      console.log('SHORT TOKEN URL:', shortUrl);

      const shortRes = await fetch(shortUrl);

      const shortToken = await shortRes.json();

      console.log('SHORT TOKEN RESPONSE:', shortToken);

      if (shortToken.error) {
        console.log('SHORT TOKEN ERROR');
        throw new UnauthorizedException(
          shortToken.error.message,
        );
      }

      // ================= LONG TOKEN =================

      const longUrl =
        `https://graph.facebook.com/v20.0/oauth/access_token` +
        `?grant_type=fb_exchange_token` +
        `&client_id=${appId}` +
        `&client_secret=${appSecret}` +
        `&fb_exchange_token=${shortToken.access_token}`;

      console.log('LONG TOKEN URL:', longUrl);

      const longRes = await fetch(longUrl);

      const longToken = await longRes.json();

      console.log('LONG TOKEN RESPONSE:', longToken);

      if (longToken.error) {
        console.log('LONG TOKEN ERROR');
        throw new UnauthorizedException(
          longToken.error.message,
        );
      }

      let metaAdAccountId = user.metaAdAccountId;
      let metaAdAccountName = user.metaAdAccountName;

      try {
        const accessToken = encodeURIComponent(longToken.access_token);
        const accountRes = await fetch(
          `https://graph.facebook.com/v20.0/me/adaccounts?fields=account_id,name&access_token=${accessToken}`
        );
        const accountJson = await accountRes.json();

        if (accountRes.ok && !accountJson.error && accountJson.data && accountJson.data.length > 0) {
          // Automatically save the first ad account found
          const firstAccount = accountJson.data[0];
          // Facebook requires the 'act_' prefix for ad account IDs in most API calls
          metaAdAccountId = firstAccount.account_id.startsWith('act_') ? firstAccount.account_id : `act_${firstAccount.account_id}`;
          metaAdAccountName = firstAccount.name;
          console.log(`Automatically fetched and saved Meta Ad Account: ${metaAdAccountName} (${metaAdAccountId})`);
        } else {
          console.warn('Could not fetch Meta ad accounts automatically:', accountJson.error || 'No accounts found');
        }
      } catch (e) {
        console.error('Failed to auto-fetch Meta Ad Account', e);
      }

      await this.usersService.update(userId, {
        metaAccessToken: longToken.access_token,
        metaAdAccountId,
        metaAdAccountName,
      });

      console.log('META CONNECT SUCCESS');

      return { success: true };

    } catch (error) {
      console.log('===== META CALLBACK ERROR =====');

      console.log(
        error?.response?.data ||
        error?.message ||
        error,
      );

      throw error;
    }
  }

  async getMetaPages(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.metaAccessToken) throw new UnauthorizedException('No Meta token');
    try {
      const res = await axios.get(`https://graph.facebook.com/v20.0/me/accounts`, {
        params: { access_token: user.metaAccessToken, fields: 'id,name,access_token,picture' }
      });
      return res.data;
    } catch (e: any) {
      throw new UnauthorizedException(e.response?.data?.error?.message || 'Failed to fetch pages');
    }
  }

  async getMetaPixels(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.metaAccessToken || !user.metaAdAccountId) throw new UnauthorizedException('No Meta token or Ad Account');
    try {
      // metaAdAccountId has 'act_' prefix, so we use it directly
      const res = await axios.get(`https://graph.facebook.com/v20.0/${user.metaAdAccountId}/adspixels`, {
        params: { access_token: user.metaAccessToken, fields: 'id,name' }
      });
      return res.data;
    } catch (e: any) {
      throw new UnauthorizedException(e.response?.data?.error?.message || 'Failed to fetch pixels');
    }
  }

  async getMetaBusinesses(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.metaAccessToken) throw new UnauthorizedException('No Meta token');
    try {
      const res = await axios.get(`https://graph.facebook.com/v20.0/me/businesses`, {
        params: { access_token: user.metaAccessToken, fields: 'id,name' }
      });
      return res.data;
    } catch (e: any) {
      throw new UnauthorizedException(e.response?.data?.error?.message || 'Failed to fetch businesses');
    }
  }

  async getMetaAdsInsights(userId: string, adAccountId: string) {
    const user = await this.usersService.findById(userId);
    if (!user?.metaAccessToken) {
      throw new UnauthorizedException('Meta not connected');
    }

    const res = await fetch(
      `https://graph.facebook.com/v20.0/${adAccountId}/insights?fields=campaign_name,impressions,clicks,spend`,
      {
        headers: {
          Authorization: `Bearer ${user.metaAccessToken}`,
        },
      },
    );

    return res.json();
  }

  async handleXCallback(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    // X (Twitter) OAuth 2.0 PKCE flow
    const clientId = this.configService.get('X_CLIENT_ID') || this.configService.get('TWITTER_CLIENT_ID');
    const clientSecret = this.configService.get('X_CLIENT_SECRET') || this.configService.get('TWITTER_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('X (Twitter) credentials not configured. Please add X_CLIENT_ID and X_CLIENT_SECRET to .env');
    }

    const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3000';

    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${backendUrl}/auth/x/callback`,
      code_verifier: 'challengechallengechallengechallengechallenge', // Must match code_challenge sent in getXAuthUrl
    });

    console.log('[X OAuth] Exchanging code for token...');

    const res = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`).toString('base64')}`,
      },
      body: params.toString(),
    });

    const tokens = await res.json() as any;
    console.log(`[X OAuth] Token response:`, { error: tokens.error, has_access_token: !!tokens.access_token });

    if (tokens.error) {
      throw new UnauthorizedException(`X OAuth error: ${tokens.error_description || tokens.error}`);
    }

    // Get user info to save Twitter username for profile display
    const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=name,username,profile_image_url', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userData = await userRes.json() as any;
    console.log(`[X OAuth] User info:`, { id: userData.data?.id, username: userData.data?.username });

    await this.usersService.update(userId, {
      twitterAccessToken: tokens.access_token,
      twitterRefreshToken: tokens.refresh_token || null,
      twitterUserId: userData.data?.id || 'x_user',           // numeric ID
      twitterUsername: userData.data?.username || null,        // @handle like WheedleTech
      twitterName: userData.data?.name || null,                // display name
    });

    return { message: 'X connected successfully' };
  }

  async handleLinkedInCallback(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
    const clientSecret = this.configService.get('LINKEDIN_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('LinkedIn credentials not configured');
    }

    const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3000';

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${backendUrl}/auth/linkedin/callback`,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokens = await res.json();
    if (tokens.error) throw new UnauthorizedException(tokens.error_description);

    // Get user info
    const userRes = await fetch('https://api.linkedin.com/v2/people/~', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userData = await userRes.json();

    await this.usersService.update(userId, {
      linkedinAccessToken: tokens.access_token,
      linkedinRefreshToken: tokens.refresh_token,
      linkedinPersonUrn: userData.id,
    });

    return { message: 'LinkedIn Ads connected successfully' };
  }

  async updateMetaCredentials(userId: string, appId: string, appSecret: string) {
    await this.usersService.update(userId, {
      metaAppId: appId,
      metaAppSecret: appSecret,
    });
    return { success: true };
  }

  async updateGoogleCredentials(userId: string, clientId?: string, clientSecret?: string, developerToken?: string, customerId?: string) {
    await this.usersService.update(userId, {
      ...(clientId && { googleClientId: clientId }),
      ...(clientSecret && { googleClientSecret: clientSecret }),
      ...(developerToken && { googleDeveloperToken: developerToken }),
      ...(customerId && { googleCustomerId: customerId }),
    });
    return { success: true };
  }

  async updateXCredentials(userId: string, accessToken: string, tokenSecret?: string, twitterUserId?: string) {
    let parsedUserId = twitterUserId;
    if (!parsedUserId && accessToken && accessToken.includes('-')) {
      parsedUserId = accessToken.split('-')[0];
    }
    await this.usersService.update(userId, {
      twitterAccessToken: accessToken,
      twitterRefreshToken: tokenSecret || null,
      twitterUserId: parsedUserId || 'default_x_user_id',
    });
    return { success: true };
  }

  async getXProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.twitterAccessToken) {
      return { connected: false };
    }
    return {
      connected: true,
      userId: user.twitterUserId,
      username: user.twitterUsername,   // @handle
      name: user.twitterName,           // Display name
      // If username not stored yet (old token), show numeric ID as fallback
      displayLabel: user.twitterUsername
        ? `@${user.twitterUsername}${user.twitterName ? ` (${user.twitterName})` : ''}`
        : `X User ID: ${user.twitterUserId}`,
    };
  }

  async getLinkedInProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.linkedinAccessToken) {
      return { connected: false };
    }

    // Fetch fresh profile from LinkedIn userinfo endpoint
    try {
      const res = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${user.linkedinAccessToken}` },
      });

      if (res.ok) {
        const data = await res.json() as any;
        return {
          connected: true,
          name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim(),
          email: data.email,
          picture: data.picture,
          sub: data.sub,
        };
      }
    } catch (e) { /* ignore fetch error */ }

    // Fallback to stored profile name
    return {
      connected: true,
      name: (user as any).linkedinName || 'LinkedIn User',
      email: (user as any).linkedinEmail,
    };
  }

  async getXAdAccounts(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.twitterAccessToken) {
      return [];
    }

    // Twitter Ads API requires special developer access that takes weeks to get approved.
    // For now, if the user has connected their X profile, we return a mock ad account 
    // so they can proceed with campaign creation in the dashboard.
    return [
      {
        id: `x-ad-acc-${user.twitterUserId || 'default'}`,
        name: `X Ad Account (${user.twitterUsername || user.twitterName || 'Connected'})`,
        status: 'ACTIVE',
      }
    ];
  }
}


