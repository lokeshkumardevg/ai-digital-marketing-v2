import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { SocialService } from './social.service';
import { AutoPostService } from './auto-post.service';
import { AuthGuard } from '@nestjs/passport';
import { PublishSocialDto } from './dto/publish-social.dto';
import { ScheduleSocialDto } from './dto/schedule-social.dto';
import { CreateAutoPostTopicDto, UpdateAutoPostTopicDto } from './dto/auto-post.dto';
import { Request } from 'express';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.m4v', '.mov', '.webm', '.avi', '.mkv']);
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 512 * 1024 * 1024;

@Controller('social')
@UseGuards(AuthGuard('jwt'))
export class SocialController {
  constructor(
    private readonly socialService: SocialService,
    private readonly autoPostService: AutoPostService,
  ) {}

  @Get()
  async getPosts(@Req() req: Request & { user?: any }, @Query('workspaceId') workspaceId?: string) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    const posts = await this.socialService.findAll(userId, workspaceId);
    return { status: 'success', data: posts };
  }

  @Post('publish')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async publishPost(@Req() req: Request & { user?: any }, @Body() dto: PublishSocialDto) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    const post = await this.socialService.publishPost(userId, dto);
    return { status: 'success', data: post };
  }

  @Post('schedule')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async schedulePost(@Req() req: Request & { user?: any }, @Body() dto: ScheduleSocialDto) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    const post = await this.socialService.schedulePost(userId, dto);
    return { status: 'success', data: post };
  }

  @Get('connections')
  async getConnections(@Req() req: Request & { user?: any }) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return {
      status: 'success',
      data: await this.socialService.getConnections(userId),
    };
  }

  // ── AUTO-POST TOPIC CRUD ──────────────────────────────────────

  @Get('auto-post')
  async getAutoPostTopics(@Req() req: Request & { user?: any }, @Query('workspaceId') workspaceId?: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const topics = await this.autoPostService.findAll(userId, workspaceId);
    return { status: 'success', data: topics };
  }

  @Post('auto-post')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createAutoPostTopic(@Req() req: Request & { user?: any }, @Body() dto: CreateAutoPostTopicDto) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const topic = await this.autoPostService.create(userId, dto);
    return { status: 'success', data: topic };
  }

  @Patch('auto-post/:id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateAutoPostTopic(
    @Req() req: Request & { user?: any },
    @Param('id') id: string,
    @Body() dto: UpdateAutoPostTopicDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const topic = await this.autoPostService.update(id, userId, dto);
    return { status: 'success', data: topic };
  }

  @Patch('auto-post/:id/toggle')
  async toggleAutoPostTopic(@Req() req: Request & { user?: any }, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const topic = await this.autoPostService.toggle(id, userId);
    return { status: 'success', data: topic };
  }

  @Delete('auto-post/:id')
  async deleteAutoPostTopic(@Req() req: Request & { user?: any }, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const result = await this.autoPostService.remove(id, userId);
    return { status: 'success', data: result };
  }

  /** Preview AI-generated post content without actually publishing */
  @Post('auto-post/:id/preview')
  async previewAutoPost(@Req() req: Request & { user?: any }, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const result = await this.autoPostService.previewPost(id, userId);
    return { status: 'success', data: result };
  }

  /** Manually trigger an AI auto-post now */
  @Post('auto-post/:id/trigger')
  async triggerAutoPost(@Req() req: Request & { user?: any }, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const result = await this.autoPostService.triggerPost(id, userId);
    return { status: 'success', data: result };
  }

  /**
   * Upload an image or video for a post. Unlike the generic /upload route this streams to disk
   * (no 15 MB / in-memory limit), so YouTube-sized videos work. Returns a path like /uploads/123.mp4
   * that can be sent as `media` to /social/publish and /social/schedule.
   */
  @Post('media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
          cb(null, UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ALLOWED_EXT.has(ext) ? ext : ''}`);
        },
      }),
      limits: { fileSize: MAX_VIDEO_BYTES },
      fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const okType = /^(image|video)\//.test(file.mimetype) && ALLOWED_EXT.has(ext);
        cb(okType ? null : new BadRequestException('Sirf image (jpg, png, webp, gif) ya video (mp4, mov, webm, avi, mkv) upload karo.'), okType);
      },
    }),
  )
  uploadMedia(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }
    const isVideo = file.mimetype.startsWith('video/');
    if (!isVideo && file.size > MAX_IMAGE_BYTES) {
      fs.unlink(file.path, () => undefined);
      throw new BadRequestException('Image 15MB se chhoti honi chahiye.');
    }
    return {
      status: 'success',
      data: { url: `/uploads/${file.filename}`, type: isVideo ? 'video' : 'image', size: file.size, name: file.originalname },
    };
  }
}
