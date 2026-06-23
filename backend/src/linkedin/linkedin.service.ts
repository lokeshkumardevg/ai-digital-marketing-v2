import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class LinkedInService {
  private readonly apiBase = 'https://api.linkedin.com/v2';
  private readonly accessToken: string;
  private urn: string | null = null;

  private readonly http: AxiosInstance;
  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>('LINKEDIN_ACCESS_TOKEN');
    if (!token) {
      throw new HttpException('LinkedIn access token not configured', 500);
    }
    this.accessToken = token;
    // Initialize axios instance with base config
    this.http = axios.create({ baseURL: this.apiBase, headers: this.getHeaders() });
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    };
  }

  private async getUrn(): Promise<string> {
    if (this.urn) return this.urn;
    const envUrn = this.config.get<string>('LINKEDIN_URN');
    if (envUrn) {
      this.urn = envUrn;
      return this.urn;
    }
    // Automatically fetch URN if not set in config
    const { data } = await this.http.get('/userinfo');
    this.urn = `urn:li:person:${data.sub}`;
    return this.urn;
  }

  async getPosts(): Promise<any> {
    const urn = await this.getUrn();
    const url = `/ugcPosts?q=authors&authors=List(${urn})`;
    const { data } = await this.http.get(url);
    return data;
  }

  async likePost(postUrn: string): Promise<any> {
    const urn = await this.getUrn();
    const url = `/socialActions/${postUrn}/likes`;
    const payload = { actor: urn };
    const { data } = await this.http.post(url, payload);
    return data;
  }

  async getEvents(): Promise<any> {
    // Retrieve events created by the authenticated user (organizer)
    const urn = await this.getUrn();
    const url = `/events?q=creator&creator=${urn}`;
    const { data } = await this.http.get(url);
    return data;
  }

  /**
   * Fetch the authenticated user’s 1st‑degree connections.
   * LinkedIn returns up to 500 connections per request.
   *
   * @param start  Zero‑based index of the first connection to return.
   * @param count  Number of connections to return (max 500).
   */
  async getConnections(start = 0, count = 100): Promise<any> {
    const url = `/connections?q=viewer&start=${start}&count=${count}`;
    const { data } = await this.http.get(url);
    return data;
  }

  /**
   * Compatibility wrapper – LinkedIn does not expose a dedicated leads API.
   * This method simply forwards to `getConnections` so existing code continues to compile.
   *
   * @param start  Pagination start index (optional).
   * @param count  Pagination count (optional).
   */
  async getLeads(start = 0, count = 100): Promise<any> {
    // NOTE: LinkedIn does not expose a dedicated leads API.
    // We return the user's connections as the closest approximation.
    return this.getConnections(start, count);
  }
}
