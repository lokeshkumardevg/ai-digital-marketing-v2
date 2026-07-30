import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'supersecret_fallback_key_2026',
      passReqToCallback: true, // ← enable so we can read headers
    });
  }

  async validate(req: Request, payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Tenant identity corrupted.');
    }
    if (user.isActive === false) {
      throw new UnauthorizedException('User account is deactivated.');
    }

    const { passwordHash, ...userData } = user.toObject ? user.toObject() : user;
    let resolvedUser = {
      ...userData,
      id: payload.sub,
      email: payload.email,
    };

    // ─── Impersonation: Superadmin overrides context with target client ───
    const impersonateId = req.headers['x-impersonate-user-id'] as string | undefined;
    if (impersonateId && (resolvedUser.role === 'superadmin' || resolvedUser.role === 'admin')) {
      try {
        const targetUser = await this.usersService.findById(impersonateId);
        if (targetUser && targetUser.isActive !== false) {
          const { passwordHash: _ph, ...targetData } = targetUser.toObject ? targetUser.toObject() : targetUser;
          resolvedUser = {
            ...targetData,
            id: impersonateId,
            email: targetData.email,
            _impersonatedBy: payload.sub, // track origin for audit
          };
        }
      } catch {
        // Silently ignore impersonation errors — fall back to admin user
      }
    }

    return resolvedUser;
  }
}
