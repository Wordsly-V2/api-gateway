import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { OAuthUser, LoginResponse } from './DTO/auth.DTO';

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
      const { accessToken }: LoginResponse =
        await this.authService.handleOAuthLogin(user);

      return res.redirect(`${frontendRedirectUrl}?access_token=${accessToken}`);
    } catch (error) {
      return res.redirect(
        `${frontendRedirectUrl}?error=${JSON.stringify(error)}`,
      );
    }
  }
}
