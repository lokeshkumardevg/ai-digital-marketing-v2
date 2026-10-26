// src/social/youtube.service.ts
// Uploads a video to the user's YouTube channel with the YouTube Data API v3 (videos.insert, resumable upload).
//
//  1. exchange the stored refresh token for a fresh access token
//  2. start a resumable upload session (metadata: title, description, tags, privacy ...)
//  3. stream the video file from our own /uploads folder to YouTube (never loads the whole file in memory)
//
// Only files that were uploaded through POST /social/media are accepted as the video source. Fetching
// arbitrary user supplied URLs from the server would let someone make the backend call internal addresses (SSRF).
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { SocialAuthService } from './social-auth.service';

export interface YoutubeUploadInput {
  videoPath: string; // '/uploads/123.mp4' or '<BACKEND_URL>/uploads/123.mp4'
  title: string;
  description?: string;
  tags?: string[];
  privacy?: 'public' | 'unlisted' | 'private';
  categoryId?: string;
  madeForKids?: boolean;
}

export interface YoutubeUploadResult {
  id: string;
  url: string;
  privacyStatus?: string;
  note?: string;
}

const MIME_BY_EXT: Record<string, string> = {
  '.mp4': 'video/mp4', '.m4v': 'video/x-m4v', '.mov': 'video/quicktime', '.webm': 'video/webm',
  '.avi': 'video/x-msvideo', '.mkv': 'video/x-matroska',
};

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly socialAuth: SocialAuthService) {}

  async upload(userId: string, input: YoutubeUploadInput): Promise<YoutubeUploadResult> {
    const file = this.resolveLocalVideo(input.videoPath);
    const privacy = input.privacy || 'private';
    const token = await this.socialAuth.getYoutubeAccessToken(userId);

    const metadata = {
      snippet: {
        title: this.cleanTitle(input.title),
        description: this.cleanDescription(input.description),
        tags: this.cleanTags(input.tags),
        categoryId: input.categoryId || '22', // 22 = People & Blogs
      },
      status: {
        privacyStatus: privacy,
        selfDeclaredMadeForKids: !!input.madeForKids,
      },
    };

    // 1) open the resumable session
    const init = await axios.post('https://www.googleapis.com/upload/youtube/v3/videos', metadata, {
      params: { uploadType: 'resumable', part: 'snippet,status' },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Length': String(file.size),
        'X-Upload-Content-Type': file.mime,
      },
    });
    const uploadUrl: string | undefined = init.headers['location'];
    if (!uploadUrl) throw new Error('YouTube did not return an upload URL.');

    // 2) stream the bytes
    this.logger.log(`YouTube upload started for user ${userId}: ${path.basename(file.fullPath)} (${file.size} bytes)`);
    const res = await axios.put(uploadUrl, fs.createReadStream(file.fullPath), {
      headers: { 'Content-Length': String(file.size), 'Content-Type': file.mime },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 0,
    });

    const id: string | undefined = res.data?.id;
    if (!id) throw new Error('YouTube upload finished but returned no video id.');

    const actual: string | undefined = res.data?.status?.privacyStatus;
    let note: string | undefined;
    if (actual && actual !== privacy) {
      // Google forces videos from API projects that have not passed the YouTube API compliance audit to "private".
      note = `YouTube ne is video ko "${actual}" rakha ("${privacy}" ki jagah). Naye Google API projects ka compliance audit pass hone tak API se upload hui videos private rehti hain. Video ko YouTube Studio se public kar sakte ho.`;
    }
    return { id, url: `https://www.youtube.com/watch?v=${id}`, privacyStatus: actual, note };
  }

  /** Maps '/uploads/x.mp4' (or the same path behind BACKEND_URL) to a file in our uploads folder. */
  private resolveLocalVideo(videoPath: string): { fullPath: string; size: number; mime: string } {
    let pathname = videoPath;
    try {
      if (/^https?:\/\//i.test(videoPath)) pathname = new URL(videoPath).pathname;
    } catch { /* fall through to the check below */ }

    if (!pathname.startsWith('/uploads/')) {
      throw new BadRequestException('YouTube ke liye video pehle Social Hub se upload karo (bahar ka link support nahi hai).');
    }
    const name = path.basename(pathname); // basename blocks ../ tricks
    const fullPath = path.join(this.uploadDir, name);
    const ext = path.extname(name).toLowerCase();
    const mime = MIME_BY_EXT[ext];
    if (!mime) throw new BadRequestException('YouTube ke liye video file (mp4, mov, webm, avi, mkv) chahiye.');
    if (!fs.existsSync(fullPath)) throw new BadRequestException('Video file server par nahi mili. Dobara upload karo.');
    return { fullPath, size: fs.statSync(fullPath).size, mime };
  }

  private cleanTitle(title: string): string {
    const t = (title || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100);
    if (!t) throw new BadRequestException('YouTube video ke liye title zaroori hai.');
    return t;
  }

  private cleanDescription(description?: string): string {
    // YouTube limit is 5000 bytes
    let d = (description || '').replace(/[<>]/g, '');
    while (Buffer.byteLength(d, 'utf8') > 5000) d = d.slice(0, -50);
    return d;
  }

  private cleanTags(tags?: string[]): string[] {
    const out: string[] = [];
    let total = 0;
    for (const raw of tags || []) {
      const tag = raw.replace(/[<>,]/g, '').trim();
      if (!tag) continue;
      if (total + tag.length > 480) break; // YouTube: 500 characters across all tags
      out.push(tag);
      total += tag.length;
    }
    return out;
  }
}
