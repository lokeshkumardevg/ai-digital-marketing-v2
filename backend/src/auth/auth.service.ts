 
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    const { passwordHash, ...userData } = user.toObject ? user.toObject() : user;
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        ...userData,
        id: user._id,
        permissions: user.permissions || []
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

getGoogleAuthUrl(userId: string) {
  const clientId = this.configService.get('GOOGLE_CLIENT_ID');

  const redirectUri = `http://localhost:3000/auth/google/callback`;

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
    const redirectUri = this.configService.get('BACKEND_URL')
      ? `${this.configService.get('BACKEND_URL')}/auth/meta/callback`
      : `http://localhost:3000/auth/meta/callback`;
    const scope = [
      'public_profile',
      'email',
    ].join(',');

    return `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${userId}`;
  }

  getXAuthUrl(userId: string) {
    const clientId = this.configService.get('X_CLIENT_ID');
    const redirectUri = `http://localhost:3000/auth/x/callback?userId=${userId}`;
    const scope = 'tweet.read%20users.read%20ads.read';
    const codeChallenge = 'challenge'; // In production, generate proper PKCE challenge

    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${userId}&code_challenge=${codeChallenge}&code_challenge_method=plain`;
  }

  getLinkedInAuthUrl(userId: string) {
    const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
    const redirectUri = `http://localhost:3000/auth/linkedin/callback?userId=${userId}`;
    const scope = 'r_ads%20r_organization_social';

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

    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: 'http://localhost:3000/auth/google/callback',
      grant_type: 'authorization_code',
    });

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokens = await res.json();
    if (tokens.error) throw new UnauthorizedException(tokens.error_description);

    await this.usersService.update(userId, {
      googleRefreshToken: tokens.refresh_token,
      googleAccessToken: tokens.access_token,
      googleTokenExpiry: Date.now() + tokens.expires_in * 1000,
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

  const res = await fetch(
    `https://googleads.googleapis.com/v16/customers/${cleanCustomerId}/googleAds:search`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',

        // ✅ VERY IMPORTANT (fix for many accounts)
        'login-customer-id': cleanCustomerId,
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

    const redirectUri =
      'http://localhost:3000/auth/meta/callback';

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

    await this.usersService.update(userId, {
      metaAccessToken: longToken.access_token,
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

  async getMetaAdsInsights(userId: string, adAccountId: string) {
    const user = await this.usersService.findById(userId);
    if (!user?.metaAccessToken) {
      throw new UnauthorizedException('Meta not connected');
    }

    const res = await fetch(
      `https://graph.facebook.com/v20.0/act_${adAccountId}/insights?fields=campaign_name,impressions,clicks,spend`,
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
    const clientId = this.configService.get('X_CLIENT_ID');
    const clientSecret = this.configService.get('X_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('X credentials not configured');
    }

    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: 'http://localhost:3000/auth/x/callback',
      code_verifier: 'challenge', // In production, this should be stored and retrieved
    });

    const res = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: params.toString(),
    });

    const tokens = await res.json();
    if (tokens.error) throw new UnauthorizedException(tokens.error_description);

    // Get user info
    const userRes = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userData = await userRes.json();

    await this.usersService.update(userId, {
      twitterAccessToken: tokens.access_token,
      twitterRefreshToken: tokens.refresh_token,
      twitterUserId: userData.data.id,
    });

    return { message: 'X Ads connected successfully' };
  }

  async handleLinkedInCallback(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
    const clientSecret = this.configService.get('LINKEDIN_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('LinkedIn credentials not configured');
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:3000/auth/linkedin/callback',
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

  async updateGoogleCredentials(userId: string, clientId: string, clientSecret: string, developerToken?: string, customerId?: string) {
    await this.usersService.update(userId, {
      googleClientId: clientId,
      googleClientSecret: clientSecret,
      ...(developerToken && { googleDeveloperToken: developerToken }),
      ...(customerId && { googleCustomerId: customerId }),
    });
    return { success: true };
  }
}


