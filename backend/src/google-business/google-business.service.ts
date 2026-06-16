import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service'; // ✅ correct import
import axios from 'axios';

@Injectable()
export class GoogleBusinessService {
  private accountBase = 'https://mybusinessaccountmanagement.googleapis.com/v1';
  private businessBase = 'https://mybusinessbusinessinformation.googleapis.com/v1';
  private reviewBase = 'https://mybusiness.googleapis.com/v4';

  constructor(
    private usersService: UsersService,   // ✅ injected properly
    private configService: ConfigService,
  ) {}

  // ✅ Internal helper — always returns a valid Google access token
  private async getValidAccessToken(userId: string): Promise<string> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.googleRefreshToken) {
      throw new UnauthorizedException(
        'Google not connected. Please reconnect your Google account.',
      );
    }

    // If token is still valid (with 5 min buffer), return it directly
    const bufferMs = 5 * 60 * 1000;
    if (
      user.googleAccessToken &&
      user.googleTokenExpiry &&
      Date.now() < user.googleTokenExpiry - bufferMs
    ) {
      return user.googleAccessToken;
    }

    // Token expired — refresh it
    console.log('[Google] Access token expired, refreshing...');

    const clientId: string =
      user.googleClientId || this.configService.get('GOOGLE_CLIENT_ID') || '';
    const clientSecret: string =
      user.googleClientSecret || this.configService.get('GOOGLE_CLIENT_SECRET') || '';

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Google credentials not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: user.googleRefreshToken,
      grant_type: 'refresh_token',
    });

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await res.json() as any;

    if (data.error) {
      throw new UnauthorizedException(
        `Failed to refresh Google token: ${data.error_description || data.error}`,
      );
    }

    // Save refreshed token to DB
    await this.usersService.update(userId, {
      googleAccessToken: data.access_token,
      googleTokenExpiry: Date.now() + (data.expires_in || 3600) * 1000,
    });

    console.log('[Google] Token refreshed successfully');
    return data.access_token;
  }

  // 🏢 Get accounts
async getAccounts(userId: string) {
  const accessToken = await this.getValidAccessToken(userId);
  return this.callWithRetry(() =>
    axios.get(`${this.accountBase}/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(res => res.data.accounts)
  );
}

  // 📍 Get locations
  async getLocations(userId: string, accountId: string) {
    const accessToken = await this.getValidAccessToken(userId);

    const res = await axios.get(
      `${this.businessBase}/accounts/${accountId}/locations`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return res.data.locations;
  }

  // ⭐ Get reviews
  async getReviews(userId: string, accountId: string, locationId: string) {
    const accessToken = await this.getValidAccessToken(userId);

    const res = await axios.get(
      `${this.reviewBase}/accounts/${accountId}/locations/${locationId}/reviews`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return res.data.reviews;
  }

  // 💬 Reply to review
  async replyToReview(
    userId: string,
    accountId: string,
    locationId: string,
    reviewId: string,
    comment: string,
  ) {
    const accessToken = await this.getValidAccessToken(userId);

    const res = await axios.put(
      `${this.reviewBase}/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`,
      { comment },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return res.data;
  }

  private async callWithRetry(fn: () => Promise<any>, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.response?.status === 429 && i < retries - 1) {
        const waitMs = (i + 1) * 10000; // 10s, 20s, 30s
        console.log(`[Google] Rate limited, waiting ${waitMs/1000}s...`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      throw error;
    }
  }
}
}