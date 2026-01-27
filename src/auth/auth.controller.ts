import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginResponse, OAuthUser } from './DTO/auth.DTO';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/health')
  getHealth() {
    return this.authService.getHealth();
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  google() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(
    @Req() { user }: Request & { user: OAuthUser },
    @Res() res: Response,
  ) {
    const frontendRedirectUrl = this.configService.get(
      'googleOAuth.frontendRedirectUrl',
    ) as string;

    try {
      const { accessToken, refreshToken }: LoginResponse =
        await this.authService.handleOAuthLogin(user);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('nodeEnv') === 'production',
        sameSite: 'lax',
        path: '/auth/refresh',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      });

      return res.redirect(`${frontendRedirectUrl}?access_token=${accessToken}`);
    } catch (error) {
      return res.redirect(
        `${frontendRedirectUrl}?error=${JSON.stringify(error)}`,
      );
    }
  }

  @Get('refresh-token')
  refresh(
    @Req() req: Request & { cookies: { refresh_token: string } },
    @Res() res: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const refreshToken = req.cookies['refresh_token'] as string;
    console.log('refreshToken:', refreshToken);
    if (!refreshToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json({ message: 'Refresh successful' });
  }
}
