import { Controller, Post, Body, UnauthorizedException, Get, Request, UseGuards, Query, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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
  @Post('google/login')
  async googleLogin(@Body() body: { code?: string; access_token?: string }) {
    if (body.code) {
      return this.authService.loginWithGoogleCode(body.code);
    }
    if (!body.access_token) {
      throw new UnauthorizedException('No code or access_token provided');
    }
    return this.authService.loginWithGoogleIdToken(body.access_token);
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
  async getGoogleAuthUrl(@Request() req: any) {
    return { url: await this.authService.getGoogleAuthUrl(req.user.id) };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('google/gsc')
  async getGoogleSearchConsoleAuthUrl(@Request() req: any) {
    return { url: await this.authService.getGoogleSearchConsoleAuthUrl(req.user.id) };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('google/ads')
  async getGoogleAds(
    @Request() req: any,
    @Query('customerId') customerId: string,
  ) {
    return this.authService.getGoogleAdsInsights(req.user.id, customerId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('google/check-accounts')
  async checkGoogleAccounts(@Request() req: any) {
    return this.authService.checkGoogleAccounts(req.user.id);
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    if (!code || !state) {
      throw new UnauthorizedException('Missing code or state');
    }

    const stateParts = state.split('_');
    const userId = stateParts[0];
    const isGsc = stateParts[1] === 'gsc';

    const frontendUrl = process.env.FRONTEND_URL;
    const redirectBase = `${frontendUrl}/settings`;

    try {
      await this.authService.handleGoogleCallback(userId, code);
      const queryParam = isGsc ? 'gscConnected=success' : 'googleConnected=success';
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectBase}?${queryParam}" /></head><body>Redirecting...</body></html>`;
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.log('[AuthController] googleCallback error', e?.message || e);
      const queryParam = isGsc ? 'gscConnected=error' : 'googleConnected=error';
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectBase}?${queryParam}" /></head><body>Redirecting...</body></html>`;
    }
  }

  @Post('google/risc')
  @HttpCode(HttpStatus.OK)
  async handleGoogleRisc(@Request() req: any, @Body() body: any) {
    let token = '';
    if (typeof body === 'string') {
      token = body;
    } else if (body && typeof body === 'object' && body.event_jwt) {
      token = body.event_jwt;
    } else if (req.rawBody) {
      token = req.rawBody.toString('utf8');
    } else {
      // Fallback: read stream
      token = await new Promise<string>((resolve) => {
        let accum = '';
        req.on('data', (chunk: any) => { accum += chunk; });
        req.on('end', () => resolve(accum));
        req.on('error', () => resolve(''));
      });
    }

    if (!token) {
      throw new BadRequestException('Empty RISC token');
    }

    return this.authService.handleRiscEvent(token);
  }

  // ================= GOOGLE CREDENTIALS =================

  @UseGuards(AuthGuard('jwt'))
  @Post('google/credentials')
  async updateGoogleCredentials(
    @Request() req: any,
    @Body() body: {
      clientId?: string;
      clientSecret?: string;
      developerToken?: string;
      customerId?: string;
    },
  ) {
    return this.authService.updateGoogleCredentials(
      req.user.id,
      body.clientId,
      body.clientSecret,
      body.developerToken,
      body.customerId,
    );
  }

  // ================= META =================

  @UseGuards(AuthGuard('jwt'))
  @Post('meta/credentials')
  async updateMetaCredentials(
    @Request() req: any,
    @Body() body: { appId: string; appSecret: string },
  ) {
    return this.authService.updateMetaCredentials(
      req.user.id,
      body.appId,
      body.appSecret,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('meta')
  getMetaAuthUrl(@Request() req: any) {
    return { url: this.authService.getMetaAuthUrl(req.user.id) };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('meta/pages')
  async getMetaPages(@Request() req: any) {
    return this.authService.getMetaPages(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('meta/pixels')
  async getMetaPixels(@Request() req: any) {
    return this.authService.getMetaPixels(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('meta/adaccounts')
  async getMetaAdAccounts(@Request() req: any) {
    return this.authService.getMetaAdAccounts(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('meta/adaccount')
  async updateMetaAdAccount(
    @Request() req: any,
    @Body() body: { adAccountId: string; adAccountName: string }
  ) {
    return this.authService.updateMetaAdAccount(req.user.id, body.adAccountId, body.adAccountName);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('meta/business')
  async updateMetaBusiness(
    @Request() req: any,
    @Body() body: { businessId: string; businessName: string }
  ) {
    return this.authService.updateMetaBusiness(req.user.id, body.businessId, body.businessName);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('meta/businesses')
  async getMetaBusinesses(@Request() req: any) {
    return this.authService.getMetaBusinesses(req.user.id);
  }

  @Get('meta/callback')
  async metaCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const frontendUrl = process.env.FRONTEND_URL;
    const redirectBase = `${frontendUrl}/settings`;

    // eslint-disable-next-line no-console
    console.log('[AuthController] metaCallback hit', {
      hasCode: Boolean(code),
      hasState: Boolean(state),
      codePreview: code ? String(code).slice(0, 8) + '...' : null,
      state,
    });

    if (!code || !state) {
      // eslint-disable-next-line no-console
      console.log('[AuthController] metaCallback missing params', { codePresent: Boolean(code), statePresent: Boolean(state) });
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectBase}?metaConnected=error&reason=missing_params" /></head><body>Redirecting...</body></html>`;
    }

    try {
      await this.authService.handleMetaCallback(state, code);
      // eslint-disable-next-line no-console
      console.log('[AuthController] metaCallback success');
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectBase}?metaConnected=success" /></head><body>Redirecting...</body></html>`;
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.log('[AuthController] metaCallback error', {
        message: e?.message || e,
        stack: e?.stack,
      });

      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectBase}?metaConnected=error" /></head><body>Redirecting...</body></html>`;
    }
  }

  // ================= X (TWITTER) =================

  @UseGuards(AuthGuard('jwt'))
  @Post('x/credentials')
  async updateXCredentials(
    @Request() req: any,
    @Body() body: { accessToken: string; tokenSecret?: string; userId?: string },
  ) {
    return this.authService.updateXCredentials(
      req.user.id,
      body.accessToken,
      body.tokenSecret,
      body.userId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('x')
  getXAuthUrl(@Request() req: any) {
    return { url: this.authService.getXAuthUrl(req.user.id) };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('x/adaccounts')
  async getXAdAccounts(@Request() req: any) {
    return { data: await this.authService.getXAdAccounts(req.user.id) };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('x/adaccount')
  async updateXAdAccount(
    @Request() req: any,
    @Body() body: { adAccountId: string; adAccountName: string }
  ) {
    return this.authService.updateXAdAccount(req.user.id, body.adAccountId, body.adAccountName);
  }

  @Get('x/callback')
  async xCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const frontendUrl = process.env.FRONTEND_URL;
    const redirectBase = `${frontendUrl}/settings`;

    if (!code || !state) {
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectBase}?xConnected=error&reason=missing_params" /></head><body>Redirecting...</body></html>`;
    }

    try {
      await this.authService.handleXCallback(state, code);
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectBase}?xConnected=success" /></head><body>Redirecting...</body></html>`;
    } catch (e: any) {
      console.log('[AuthController] xCallback error', e?.message || e);
      const errorReason = encodeURIComponent(e?.message || 'unknown_error');
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectBase}?xConnected=error&reason=${errorReason}" /></head><body>Redirecting...</body></html>`;
    }
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
    @Query('state') state: string,
  ) {
    const frontendUrl = process.env.FRONTEND_URL;
    const redirectBase = `${frontendUrl}/settings`;

    if (!code || !state) {
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectBase}?linkedinConnected=error&reason=missing_params" /></head><body>Redirecting...</body></html>`;
    }

    try {
      await this.authService.handleLinkedInCallback(state, code);
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectBase}?linkedinConnected=success" /></head><body>Redirecting...</body></html>`;
    } catch (e: any) {
      console.log('[AuthController] linkedinCallback error', e?.message || e);
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectBase}?linkedinConnected=error" /></head><body>Redirecting...</body></html>`;
    }
  }
}

