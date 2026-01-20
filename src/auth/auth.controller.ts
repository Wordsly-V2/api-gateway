import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { IOAuthLoginResponseDTO, IOAuthUserDTO } from './DTO/auth.DTO';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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

    const frontendRedirectUrl = this.configService.get(
      'googleOAuth.frontendRedirectUrl',
    ) as string;

    try {
      const loginResponse: IOAuthLoginResponseDTO = await firstValueFrom(
        this.authService.handleOAuthLogin(user),
      );
      const accessToken = await this.jwtService.signAsync(loginResponse);

      return res.redirect(`${frontendRedirectUrl}?access_token=${accessToken}`);
    } catch (error) {
      return res.redirect(
        `${frontendRedirectUrl}?error=${(error as Error).message}`,
      );
    }
  }
}
