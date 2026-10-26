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

type SocialPlatform = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'meta' | 'youtube';

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
        this.configService.get<string>('LINKEDIN_SCOPES') || 'openid profile w_member_social email rw_ads r_ads r_organization_admin w_organization_social r_ads_reporting';
      return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}`;
    }

    if (normalized === 'twitter') {
      const { clientId } = this.getTwitterCredentials();
      console.log('Generating Twitter auth URL with clientId:', clientId);
      const scope =
        this.configService.get<string>('TWITTER_SCOPES') ||
        'tweet.read tweet.write users.read offline.access';
      const codeChallenge = this.buildCodeVerifier(userId);
      return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=plain`;
    }

    if (normalized === 'youtube') {
      const { clientId } = this.getGoogleCredentials();
      // youtube.upload = post videos, youtube.readonly = read the channel name/id.
      // access_type=offline + prompt=consent so Google always returns a refresh token.
      const scope =
        this.configService.get<string>('YOUTUBE_SCOPES') ||
        'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly';
      return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}&access_type=offline&prompt=consent&include_granted_scopes=true`;
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
      const { clientId, clientSecret } = this.getTwitterCredentials();
      const tokenResponse = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.getRedirectUri('twitter'),
          client_id: clientId,
          code_verifier: this.buildCodeVerifier(decoded.userId),
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: clientId,
            password: clientSecret,
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

    if (normalized === 'youtube') {
      const { clientId, clientSecret } = this.getGoogleCredentials();
      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.getRedirectUri('youtube'),
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const accessToken: string = tokenResponse.data.access_token;
      const refreshToken: string | undefined = tokenResponse.data.refresh_token;
      if (!refreshToken && !user.youtubeRefreshToken) {
        throw new BadRequestException('Google did not return a refresh token. Remove the app from your Google account permissions and connect again.');
      }

      // Which channel will the videos go to?
      const channels = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: { part: 'snippet', mine: 'true' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const channel = channels.data?.items?.[0];
      if (!channel?.id) {
        throw new BadRequestException('This Google account has no YouTube channel. Create a channel on youtube.com first.');
      }

      await this.usersService.update(String(user._id), {
        youtubeAccessToken: accessToken,
        youtubeRefreshToken: refreshToken || user.youtubeRefreshToken,
        youtubeChannelId: channel.id,
        youtubeChannelTitle: channel.snippet?.title || null,
      });

      return { platform: 'youtube', connected: true };
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
      youtube: Boolean(user.youtubeRefreshToken && user.youtubeChannelId),
      youtubeChannel: user.youtubeChannelTitle || null,
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
    } else if (platform === 'youtube') {
      // best effort: also revoke the grant at Google so the app disappears from the user's account permissions
      const token = user.youtubeRefreshToken || user.youtubeAccessToken;
      if (token) {
        await axios
          .post('https://oauth2.googleapis.com/revoke', new URLSearchParams({ token }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
          .catch(() => undefined);
      }
      updates.youtubeAccessToken = null;
      updates.youtubeRefreshToken = null;
      updates.youtubeChannelId = null;
      updates.youtubeChannelTitle = null;
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
      const { clientId, clientSecret } = this.getTwitterCredentials();
      const tokenResponse = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: user.twitterRefreshToken,
          client_id: clientId,
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          auth: {
            username: clientId,
            password: clientSecret,
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

  /** Google access tokens last ~1 hour, so we exchange the stored refresh token every time we upload. */
  async getYoutubeAccessToken(userId: string): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (!user?.youtubeRefreshToken) {
      throw new NotFoundException('YouTube is not connected. Connect it from the Social Hub page.');
    }
    const { clientId, clientSecret } = this.getGoogleCredentials();
    try {
      const res = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: user.youtubeRefreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
      await this.usersService.update(userId, { youtubeAccessToken: res.data.access_token });
      return res.data.access_token as string;
    } catch (e: any) {
      if (e?.response?.data?.error === 'invalid_grant') {
        // user revoked access or the token expired (Google testing-mode apps: 7 days)
        await this.usersService.update(userId, { youtubeAccessToken: null, youtubeRefreshToken: null, youtubeChannelId: null, youtubeChannelTitle: null });
        throw new NotFoundException('YouTube connection expired. Please connect YouTube again.');
      }
      throw e;
    }
  }

  private getGoogleCredentials(): { clientId: string; clientSecret: string } {
    const clientId = this.configService.get<string>('YOUTUBE_CLIENT_ID') || this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('YOUTUBE_CLIENT_SECRET') || this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('Google credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are not configured.');
    }
    return { clientId, clientSecret };
  }

  private normalizePlatform(platform: string): SocialPlatform {
    const value = platform?.toLowerCase();
    if (!['linkedin', 'twitter', 'facebook', 'instagram', 'meta', 'youtube'].includes(value)) {
      throw new BadRequestException('Unsupported social platform.');
    }
    return value as SocialPlatform;
  }

  private getRedirectUri(platform: SocialPlatform): string {
    const backendUrl = this.configService.get<string>('BACKEND_URL');
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

  private getTwitterCredentials(): { clientId: string; clientSecret: string } {
    const clientId = this.configService.get<string>('TWITTER_CLIENT_ID') || this.configService.get<string>('X_CLIENT_ID');
    const clientSecret = this.configService.get<string>('TWITTER_CLIENT_SECRET') || this.configService.get<string>('X_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('Twitter/X credentials (TWITTER_CLIENT_ID/X_CLIENT_ID and TWITTER_CLIENT_SECRET/X_CLIENT_SECRET) are not fully configured.');
    }
    return { clientId, clientSecret };
  }
}
