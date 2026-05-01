 
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
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
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
      redirect_uri: 'http://localhost:3001/auth/google/callback',
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

    const accessToken = await this.getGoogleAccessToken(userId, user.googleRefreshToken);

    const query = `
      SELECT campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros
      FROM campaign
      ORDER BY metrics.impressions DESC
      LIMIT 10
    `;

    const developerToken = user.googleDeveloperToken || this.configService.get('GOOGLE_DEVELOPER_TOKEN');

    if (!developerToken) {
      throw new UnauthorizedException('Google developer token not configured');
    }

    const res = await fetch(
      `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      },
    );

    return res.json();
  }

  // ================= META =================

  async handleMetaCallback(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const appId = user.metaAppId || this.configService.get('META_APP_ID');
    const appSecret = user.metaAppSecret || this.configService.get('META_APP_SECRET');

    // Short-lived token
    const shortRes = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=http://localhost:3001/auth/meta/callback&code=${code}`
    );

    const shortToken = await shortRes.json();
    if (shortToken.error) throw new UnauthorizedException(shortToken.error.message);

    // Long-lived token
    const longRes = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken.access_token}`
    );

    const longToken = await longRes.json();
    if (longToken.error) throw new UnauthorizedException(longToken.error.message);

    await this.usersService.update(userId, {
      metaAccessToken: longToken.access_token,
    });

    return { success: true };
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

  async updateGoogleCredentials(userId: string, clientId: string, clientSecret: string, developerToken?: string) {
    await this.usersService.update(userId, {
      googleClientId: clientId,
      googleClientSecret: clientSecret,
      ...(developerToken && { googleDeveloperToken: developerToken }),
    });
    return { success: true };
  }

  async updateMetaCredentials(userId: string, appId: string, appSecret: string) {
    await this.usersService.update(userId, {
      metaAppId: appId,
      metaAppSecret: appSecret,
    });
    return { success: true };
  }
}


