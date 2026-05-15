import { Controller, Post, Body, UnauthorizedException, Get, Request, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('update')
  async updateProfile(@Request() req: any, @Body() updateDto: any) {
    return this.authService.updateProfile(req.user.id, updateDto);
  }

  // ================= GOOGLE =================

  // ✅ Keep JWT here (user must be logged in to connect Google)
  @UseGuards(AuthGuard('jwt'))
  @Get('google')
  getGoogleAuthUrl(@Request() req: any) {
    return { url: this.authService.getGoogleAuthUrl(req.user.id) };
  }
@UseGuards(AuthGuard('jwt'))
@Get('google/ads')
async getGoogleAds(
  @Request() req: any,
  @Query('customerId') customerId: string
) {
  return this.authService.getGoogleAdsInsights(req.user.id, customerId);
}
@Get('google/callback')
async googleCallback(
  @Query('code') code: string,
  @Query('state') state: string
) {
  if (!code || !state) {
    throw new UnauthorizedException('Missing code or state');
  }

  const userId = state;

  // Pass-through redirect target for browser
  const redirectBase = 'http://localhost:5173/crm';
  try {
    await this.authService.handleGoogleCallback(userId, code);
    return `<html><head><meta http-equiv="refresh" content="0; url=${redirectBase}?googleConnected=success" /></head><body>Redirecting...</body></html>`;
  } catch (e) {
    return `<html><head><meta http-equiv="refresh" content="0; url=${redirectBase}?googleConnected=error" /></head><body>Redirecting...</body></html>`;
  }
}

  // ================= GOOGLE CREDENTIALS =================

  @UseGuards(AuthGuard('jwt'))
  @Post('google/credentials')
  async updateGoogleCredentials(
    @Request() req: any,
    @Body() body: {
      clientId: string;
      clientSecret: string;
      developerToken?: string;
      customerId?: string;
    }
  ) {
    return this.authService.updateGoogleCredentials(
      req.user.id,
      body.clientId,
      body.clientSecret,
      body.developerToken,
      body.customerId
    );
  }

  // ================= META =================

  @UseGuards(AuthGuard('jwt'))
  @Post('meta/credentials')
  async updateMetaCredentials(
    @Request() req: any,
    @Body() body: { appId: string; appSecret: string }
  ) {
    return this.authService.updateMetaCredentials(
      req.user.id,
      body.appId,
      body.appSecret
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('meta')
  getMetaAuthUrl(@Request() req: any) {
    return { url: this.authService.getMetaAuthUrl(req.user.id) };
  }

@Get('meta/callback')
async metaCallback(
  @Query('code') code: string,
  @Query('state') state: string
) {
  return this.authService.handleMetaCallback(state, code);
}

  // ================= X (TWITTER) =================

  @UseGuards(AuthGuard('jwt'))
  @Get('x')
  getXAuthUrl(@Request() req: any) {
    return { url: this.authService.getXAuthUrl(req.user.id) };
  }

@Get('x/callback')
async xCallback(
  @Query('code') code: string,
  @Query('state') state: string
) {
  return this.authService.handleXCallback(state, code);
}

  // ================= LINKEDIN =================

  @UseGuards(AuthGuard('jwt'))
  @Get('linkedin')
  getLinkedInAuthUrl(@Request() req: any) {
    return { url: this.authService.getLinkedInAuthUrl(req.user.id) };
  }

@Get('linkedin/callback')
async linkedinCallback(
  @Query('code') code: string,
  @Query('state') state: string
) {
  return this.authService.handleLinkedInCallback(state, code);
}
}
