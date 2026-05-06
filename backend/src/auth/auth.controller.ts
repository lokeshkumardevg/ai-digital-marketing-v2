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
  // ❌ REMOVE JWT GUARD HERE (IMPORTANT FIX)
  // Google will call this route WITHOUT JWT
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('userId') userId: string
  ) {
    return this.authService.handleGoogleCallback(userId, code);
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
}