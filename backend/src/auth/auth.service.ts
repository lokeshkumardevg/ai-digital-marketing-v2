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
        subscriptionTier: user.subscriptionTier
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

  async handleGoogleCallback(userId: string, code: string): Promise<{ success: boolean; tokens: any }> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const params = new URLSearchParams({
      code,
      client_id: user.googleClientId || this.configService.get('GOOGLE_CLIENT_ID') || '',
      client_secret: user.googleClientSecret || this.configService.get('GOOGLE_CLIENT_SECRET') || '',
      redirect_uri: 'http://localhost:3001/auth/google/callback',
      grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch(`https://oauth2.googleapis.com/token?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const tokens = await tokenResponse.json();
    if (tokens.error) throw new UnauthorizedException(tokens.error_description);

    await this.usersService.update(userId, {
      googleRefreshToken: tokens.refresh_token,
    });

    return { success: true, tokens: { access_token: tokens.access_token, expires_in: tokens.expires_in } };
  }

  async handleMetaCallback(userId: string, code: string, state: string): Promise<{ success: boolean; tokens: any }> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const tokenResponse = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?client_id=${user.metaAppId || this.configService.get('META_APP_ID')}&client_secret=${user.metaAppSecret || this.configService.get('META_APP_SECRET')}&redirect_uri=http://localhost:3001/auth/meta/callback&code=${code}`, { method: 'GET' });

    const tokens = await tokenResponse.json();
    if (tokens.error) throw new UnauthorizedException(tokens.error.message);

    await this.usersService.update(userId, {
      metaAccessToken: tokens.access_token,
    });

    return { success: true, tokens };
  }
}

