import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import {
  IOAuthLoginResponseDTO,
  IOAuthUserDTO,
  JwtAuthPayload,
} from './DTO/auth.DTO';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { randomUUID } from 'crypto';

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

      const jwtPayload: JwtAuthPayload = {
        userLoginId: loginResponse.userLoginId,
        jti: randomUUID(),
      };

      const accessToken = await this.jwtService.signAsync(jwtPayload);

      return res.redirect(`${frontendRedirectUrl}?access_token=${accessToken}`);
    } catch (error) {
      return res.redirect(
        `${frontendRedirectUrl}?error=${JSON.stringify(error)}`,
      );
    }
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  protected(): string {
    return 'protected';
  }
}
