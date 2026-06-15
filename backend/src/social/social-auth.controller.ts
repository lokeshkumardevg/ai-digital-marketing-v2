import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SocialAuthService } from './social-auth.service';
import { Request } from 'express';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('social')
export class SocialAuthController {
  constructor(
    private readonly socialAuthService: SocialAuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('auth/:platform')
  async getAuthUrl(@Param('platform') platform: string, @Req() req: Request & { user?: any }) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return {
      status: 'success',
      data: {
        url: this.socialAuthService.getAuthUrl(platform, userId),
      },
    };
  }

  @Get('auth/:platform/callback')
  async callback(
    @Param('platform') platform: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      await this.socialAuthService.handleCallback(platform, code, state);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/social?social_connect=${platform}&status=success`);
    } catch {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/social?social_connect=${platform}&status=error`);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('auth/connections')
  async getAuthConnections(@Req() req: Request & { user?: any }) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return {
      status: 'success',
      data: await this.socialAuthService.getConnections(userId),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('auth/:platform/disconnect')
  async disconnectPlatform(@Param('platform') platform: string, @Req() req: Request & { user?: any }) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return {
      status: 'success',
      data: await this.socialAuthService.disconnectPlatform(userId, platform),
    };
  }
}
