import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import axios from 'axios';
import { createHmac, randomBytes } from 'crypto';

type SocialPlatform = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'meta';

@Injectable()
export class SocialAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  getAuthUrl(platform: string, userId: string): string {
    const normalized = this.normalizePlatform(platform);
    const redirectUri = this.getRedirectUri(normalized);
    const state = this.createState(userId, normalized);

    if (normalized === 'linkedin') {
      const clientId = this.getEnv('LINKEDIN_CLIENT_ID');
      const scope =
        this.configService.get<string>('LINKEDIN_SCOPES') || 'openid profile w_member_social email rw_ads r_ads r_organization_admin w_organization_social';
      return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}`;
    }

    if (normalized === 'twitter') {
      const clientId = this.getEnv('TWITTER_CLIENT_ID');
      console.log('Generating Twitter auth URL with clientId:', clientId);
      const scope =
        this.configService.get<string>('TWITTER_SCOPES') ||
        'tweet.read tweet.write users.read offline.access';
      const codeChallenge = this.buildCodeVerifier(userId);
      return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=plain`;
    }

    const clientId = this.getEnv('META_APP_ID');
    const scope =
      this.configService.get<string>('META_SCOPES') ||
      'pages_show_list,pages_manage_posts,instagram_basic,instagram_content_publish';
    return `https://www.facebook.com/v20.0/dialog/oauth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}&response_type=code`;
  }

  async handleCallback(
    platform: string,
    code: string,
    state: string,
  ): Promise<{ platform: string; connected: boolean }> {
    if (!code || !state) {
      throw new BadRequestException('Missing OAuth callback parameters.');
    }

    const normalized = this.normalizePlatform(platform);
    const decoded = this.verifyState(state);
    const user = await this.usersService.findById(decoded.userId);

    if (!user) {
      throw new NotFoundException('User not found for OAuth callback.');
    }

    if (normalized === 'linkedin') {
      const tokenResponse = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.getRedirectUri('linkedin'),
          client_id: this.getEnv('LINKEDIN_CLIENT_ID'),
          client_secret: this.getEnv('LINKEDIN_CLIENT_SECRET'),
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const person = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
      });

      await this.usersService.update(String(user._id), {
        linkedinAccessToken: tokenResponse.data.access_token,
        linkedinRefreshToken: tokenResponse.data.refresh_token || null,
        linkedinPersonUrn: person.data?.sub || person.data?.id || null, // FIXED: was incorrectly saving as linkedinPersonId
      });

      return { platform: 'linkedin', connected: true };
    }

    if (normalized === 'twitter') {
      const tokenResponse = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.getRedirectUri('twitter'),
          client_id: this.getEnv('TWITTER_CLIENT_ID'),
          code_verifier: this.buildCodeVerifier(decoded.userId),
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: this.getEnv('TWITTER_CLIENT_ID'),
            password: this.getEnv('TWITTER_CLIENT_SECRET'),
          },
        },
      );

      const profile = await axios.get('https://api.twitter.com/2/users/me', {
        headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
      });

      await this.usersService.update(String(user._id), {
        twitterAccessToken: tokenResponse.data.access_token,
        twitterRefreshToken: tokenResponse.data.refresh_token || null,
        twitterUserId: profile.data?.data?.id || null,
      });

      return { platform: 'twitter', connected: true };
    }

    const shortLived = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
      params: {
        client_id: this.getEnv('META_APP_ID'),
        client_secret: this.getEnv('META_APP_SECRET'),
        redirect_uri: this.getRedirectUri('facebook'),
        code,
      },
    });

    const longLived = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: this.getEnv('META_APP_ID'),
        client_secret: this.getEnv('META_APP_SECRET'),
        fb_exchange_token: shortLived.data.access_token,
      },
    });

    const accounts = await axios.get('https://graph.facebook.com/v20.0/me/accounts', {
      params: {
        access_token: longLived.data.access_token,
      },
    });

    const firstPage = accounts.data?.data?.[0];
    const igResponse = firstPage
      ? await axios.get(`https://graph.facebook.com/v20.0/${firstPage.id}`, {
          params: {
            fields: 'instagram_business_account',
            access_token: firstPage.access_token,
          },
        })
      : null;

    await this.usersService.update(String(user._id), {
      metaAccessToken: firstPage?.access_token || longLived.data.access_token,
      instagramAccessToken: firstPage?.access_token || longLived.data.access_token,
      instagramUserId: igResponse?.data?.instagram_business_account?.id || null,
    });

    return { platform: normalized, connected: true };
  }

  async getConnections(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return {
      linkedin: Boolean(user.linkedinAccessToken && user.linkedinPersonUrn),
      twitter: Boolean(user.twitterAccessToken && user.twitterUserId),
      facebook: Boolean(user.metaAccessToken),
      instagram: Boolean(user.instagramAccessToken && user.instagramUserId),
    };
  }

  async disconnectPlatform(userId: string, platform: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const updates: any = {};
    if (platform === 'linkedin') {
      updates.linkedinAccessToken = null;
      updates.linkedinRefreshToken = null;
      updates.linkedinPersonUrn = null;
    } else if (platform === 'twitter') {
      updates.twitterAccessToken = null;
      updates.twitterRefreshToken = null;
      updates.twitterUserId = null;
    } else if (platform === 'facebook') {
      updates.metaAccessToken = null;
    } else if (platform === 'instagram') {
      updates.instagramAccessToken = null;
      updates.instagramUserId = null;
    }

    await this.usersService.update(String(user._id), updates);
    return this.getConnections(userId);
  }

  async refreshToken(userId: string, platform: SocialPlatform): Promise<string | null> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (platform === 'twitter' && user.twitterRefreshToken) {
      const tokenResponse = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: user.twitterRefreshToken,
          client_id: this.getEnv('TWITTER_CLIENT_ID'),
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          auth: {
            username: this.getEnv('TWITTER_CLIENT_ID'),
            password: this.getEnv('TWITTER_CLIENT_SECRET'),
          },
        },
      );

      await this.usersService.update(userId, {
        twitterAccessToken: tokenResponse.data.access_token,
        twitterRefreshToken: tokenResponse.data.refresh_token || user.twitterRefreshToken,
      });

      return tokenResponse.data.access_token;
    }

    if (platform === 'linkedin' && user.linkedinRefreshToken) {
      const tokenResponse = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: user.linkedinRefreshToken,
          client_id: this.getEnv('LINKEDIN_CLIENT_ID'),
          client_secret: this.getEnv('LINKEDIN_CLIENT_SECRET'),
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      await this.usersService.update(userId, {
        linkedinAccessToken: tokenResponse.data.access_token,
        linkedinRefreshToken: tokenResponse.data.refresh_token || user.linkedinRefreshToken,
      });

      return tokenResponse.data.access_token;
    }

    return null;
  }

  private normalizePlatform(platform: string): SocialPlatform {
    const value = platform?.toLowerCase();
    if (!['linkedin', 'twitter', 'facebook', 'instagram', 'meta'].includes(value)) {
      throw new BadRequestException('Unsupported social platform.');
    }
    return value as SocialPlatform;
  }

  private getRedirectUri(platform: SocialPlatform): string {
    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000';
    const fromEnv = this.configService.get<string>(`${platform.toUpperCase()}_REDIRECT_URI`);
    return fromEnv || `${backendUrl}/social/auth/${platform}/callback`;
  }

  private getEnv(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new InternalServerErrorException(`${key} is not configured.`);
    }
    return value;
  }

  private createState(userId: string, platform: SocialPlatform): string {
    const payload = `${userId}.${platform}.${Date.now()}.${randomBytes(8).toString('hex')}`;
    const secret = this.configService.get<string>('SOCIAL_AUTH_STATE_SECRET') || 'social-state-secret';
    const signature = createHmac('sha256', secret).update(payload).digest('hex');
    return Buffer.from(`${payload}.${signature}`).toString('base64url');
  }

  private verifyState(state: string): { userId: string; platform: string } {
    const secret = this.configService.get<string>('SOCIAL_AUTH_STATE_SECRET') || 'social-state-secret';
    const decoded = Buffer.from(state, 'base64url').toString();
    const parts = decoded.split('.');
    if (parts.length < 6) {
      throw new BadRequestException('Invalid OAuth state.');
    }
    const signature = parts.pop() as string;
    const payload = parts.join('.');
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    if (signature !== expected) {
      throw new BadRequestException('OAuth state signature mismatch.');
    }
    return { userId: parts[0], platform: parts[1] };
  }

  private buildCodeVerifier(userId: string): string {
    const key = this.configService.get<string>('TWITTER_CODE_VERIFIER_SECRET') || 'twitter-verifier-secret';
    return createHmac('sha256', key).update(userId).digest('hex').slice(0, 64);
  }
}
