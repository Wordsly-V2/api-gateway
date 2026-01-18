import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { IOAuthLoginResponseDTO, IOAuthUserDTO } from './DTO/auth.DTO';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  ): Promise<void> {
    const { user } = req;

    const loginResponse: IOAuthLoginResponseDTO = await firstValueFrom(
      this.authService.handleOAuthLogin(user),
    );

    console.log(loginResponse);
  }
}
