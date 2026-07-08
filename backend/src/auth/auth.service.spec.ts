import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { BadRequestException } from '@nestjs/common';

jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      return {
        getFederatedSignonCertsAsync: jest.fn().mockResolvedValue({
          certs: { 'key-123': 'mock-cert-pem' }
        }),
        verifySignedJwtWithCertsAsync: jest.fn().mockImplementation((token) => {
          if (token === 'invalid-token') {
            throw new Error('Invalid signature');
          }
          return {
            getPayload: () => {
              if (token === 'sessions-revoked-token') {
                return {
                  iss: 'https://accounts.google.com',
                  aud: 'mock-client-id',
                  sub: 'google-user-123',
                  events: {
                    'https://schemas.openid.net/secevent/risc/event-type/sessions-revoked': {
                      subject: {
                        subject_type: 'iss_sub',
                        iss: 'https://accounts.google.com',
                        sub: 'google-user-123'
                      }
                    }
                  }
                };
              }
              if (token === 'account-disabled-token') {
                return {
                  iss: 'https://accounts.google.com',
                  aud: 'mock-client-id',
                  sub: 'google-user-123',
                  events: {
                    'https://schemas.openid.net/secevent/risc/event-type/account-disabled': {
                      subject: {
                        subject_type: 'iss_sub',
                        iss: 'https://accounts.google.com',
                        sub: 'google-user-123'
                      }
                    }
                  }
                };
              }
              return null;
            }
          };
        })
      };
    })
  };
});

describe('AuthService - RISC Events', () => {
  let authService: AuthService;
  let usersService: UsersService;

  const mockUser = {
    _id: 'user-id-123',
    email: 'test@example.com',
    googleUserId: 'google-user-123',
    googleAccessToken: 'old-access-token',
    googleRefreshToken: 'old-refresh-token',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByGoogleUserId: jest.fn().mockImplementation((googleUserId) => {
              if (googleUserId === 'google-user-123') return mockUser;
              return null;
            }),
            update: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'GOOGLE_CLIENT_ID') return 'mock-client-id';
              return null;
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should successfully revoke Google tokens on sessions-revoked event', async () => {
    const result = await authService.handleRiscEvent('sessions-revoked-token');
    expect(result).toEqual({ status: 'success' });
    expect(usersService.update).toHaveBeenCalledWith('user-id-123', {
      googleAccessToken: undefined,
      googleRefreshToken: undefined,
      googleTokenExpiry: undefined,
      googleSearchConsoleConnected: false,
    });
  });

  it('should deactivate user account and revoke tokens on account-disabled event', async () => {
    const result = await authService.handleRiscEvent('account-disabled-token');
    expect(result).toEqual({ status: 'success' });
    expect(usersService.update).toHaveBeenCalledWith('user-id-123', {
      googleAccessToken: undefined,
      googleRefreshToken: undefined,
      googleTokenExpiry: undefined,
      googleSearchConsoleConnected: false,
      isActive: false,
    });
  });

  it('should throw BadRequestException if token is invalid', async () => {
    await expect(authService.handleRiscEvent('invalid-token')).rejects.toThrow(
      BadRequestException
    );
  });
});
