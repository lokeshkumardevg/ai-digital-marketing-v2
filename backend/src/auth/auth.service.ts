import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
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
}
