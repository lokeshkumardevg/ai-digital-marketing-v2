import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GoogleBusinessService {
  private oauthBase = 'https://oauth2.googleapis.com';
  private accountBase =
    'https://mybusinessaccountmanagement.googleapis.com/v1';
  private businessBase =
    'https://mybusinessbusinessinformation.googleapis.com/v1';
  private reviewBase = 'https://mybusiness.googleapis.com/v4';

  // 🔐 STEP 1: Exchange OAuth code
  async getTokens(code: string) {
    const res = await axios.post(`${this.oauthBase}/token`, {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    return res.data;
  }

  // 🏢 STEP 2: Get accounts
  async getAccounts(accessToken: string) {
    const res = await axios.get(`${this.accountBase}/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return res.data.accounts;
  }

  // 📍 STEP 3: Get locations
  async getLocations(accessToken: string, accountId: string) {
    const res = await axios.get(
      `${this.businessBase}/accounts/${accountId}/locations`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return res.data.locations;
  }

  // ⭐ STEP 4: Get reviews
  async getReviews(
    accessToken: string,
    accountId: string,
    locationId: string,
  ) {
    const res = await axios.get(
      `${this.reviewBase}/accounts/${accountId}/locations/${locationId}/reviews`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return res.data.reviews;
  }

  // 💬 STEP 5: Reply to review
  async replyToReview(
    accessToken: string,
    accountId: string,
    locationId: string,
    reviewId: string,
    comment: string,
  ) {
    const res = await axios.put(
      `${this.reviewBase}/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`,
      { comment },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return res.data;
  }

  // 🔄 STEP 6: Refresh token
  async refreshToken(refreshToken: string) {
    const res = await axios.post(`${this.oauthBase}/token`, {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    return res.data;
  }
}