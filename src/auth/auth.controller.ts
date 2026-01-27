import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthPayload, LoginResponse, OAuthUser } from './DTO/auth.dto';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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
    @Req() req: Request & { user: OAuthUser },
    @Res() res: Response,
  ) {
    const userIpAddress = req.ip;
    const frontendRedirectUrl = this.configService.get(
      'googleOAuth.frontendRedirectUrl',
    ) as string;

    try {
      const { accessToken, refreshToken }: LoginResponse =
        await this.authService.handleOAuthLogin(req.user, userIpAddress);
      this.setRefreshTokenCookie(res, refreshToken);

      return res.redirect(`${frontendRedirectUrl}?access_token=${accessToken}`);
    } catch (error) {
      return res.redirect(
        `${frontendRedirectUrl}?error=${JSON.stringify(error)}`,
      );
    }
  }

  @Get('refresh-token')
  async refresh(
    @Req() req: Request & { cookies: { refresh_token: string } },
    @Res() res: Response,
  ) {
    const userIpAddress = req.ip;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const refreshToken = req.cookies['refresh_token'] as string;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const jwtPayload = this.jwtService.verify<JwtAuthPayload>(refreshToken);

      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }: LoginResponse = await this.authService.handleRefreshToken({
        jwtPayload,
        userIpAddress,
      });

      this.setRefreshTokenCookie(res, newRefreshToken);

      return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    const refreshTokenExpiresIn = this.configService.get<string>(
      'jwt.refreshTokenExpiresIn',
    ) as ms.StringValue;

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('nodeEnv') === 'production',
      sameSite: 'lax',
      path: '/auth',
      maxAge: ms(refreshTokenExpiresIn),
    });
  }
}
