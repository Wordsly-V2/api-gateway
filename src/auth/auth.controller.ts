import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { IOAuthLoginResponseDTO, IOAuthUserDTO } from './DTO/auth.DTO';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/health')
  getHealth(): Observable<string> {
    return this.authService.getHealth();
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  google(): void {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(
    @Req() req: Request & { user: IOAuthUserDTO },
    @Res() res: Response,
  ) {
    const { user } = req;

    const loginResponse: IOAuthLoginResponseDTO = await firstValueFrom(
      this.authService.handleOAuthLogin(user),
    );

    const frontendRedirectUrl = this.configService.get(
      'googleOAuth.frontendRedirectUrl',
    ) as string;

    return res.redirect(
      `${frontendRedirectUrl}?access_token=${loginResponse.accessToken}`,
    );
  }
}
