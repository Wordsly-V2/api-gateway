import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthPayload, LoginResponse, OAuthUser } from './DTO/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  async getHealth(): Promise<string> {
    return await firstValueFrom(this.authService.send('health', ''));
  }

  async handleOAuthLogin(
    user: OAuthUser,
    userIpAddress: string | undefined,
  ): Promise<LoginResponse> {
    const loginResponse: LoginResponse = await firstValueFrom(
      this.authService.send('login_oauth', { user, userIpAddress }),
    );

    return loginResponse;
  }

  async handleRefreshToken({
    jwtPayload,
    userIpAddress,
  }: {
    jwtPayload: JwtAuthPayload;
    userIpAddress: string | undefined;
  }): Promise<LoginResponse> {
    const refreshTokenResponse: LoginResponse = await firstValueFrom(
      this.authService.send('refresh_token', { jwtPayload, userIpAddress }),
    );

    return refreshTokenResponse;
  }

  async handleLogout(
    user: JwtAuthPayload,
    isLoggedOutFromAllDevices: boolean = false,
  ): Promise<void> {
    await firstValueFrom(
      this.authService.send('logout', { user, isLoggedOutFromAllDevices }),
    );
    return;
  }
}
