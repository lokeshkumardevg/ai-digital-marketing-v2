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

  @UseGuards(AuthGuard('jwt'))
  @Post('google/callback')
  async googleCallback(@Request() req: any, @Body() body: { code: string }) {
    return this.authService.handleGoogleCallback(req.user.id, body.code);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('meta/callback')
  async metaCallback(@Request() req: any, @Body() body: { code: string; state: string }) {
    return this.authService.handleMetaCallback(req.user.id, body.code, body.state);
  }
}

