import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';
import { firstValueFrom } from 'rxjs';
import {
  OAuthLoginServiceResponse,
  OAuthUser,
  LoginResponse,
  JwtAuthPayload,
} from './DTO/auth.DTO';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async getHealth(): Promise<string> {
    return await firstValueFrom(this.authService.send('health', ''));
  }

  async handleOAuthLogin(user: OAuthUser): Promise<LoginResponse> {
    const loginResponse: OAuthLoginServiceResponse = await firstValueFrom(
      this.authService.send('login_oauth', user),
    );

    const accessToken = await this.jwtService.signAsync<JwtAuthPayload>({
      userLoginId: loginResponse.userLoginId,
      jti: randomUUID(),
    });

    return {
      accessToken,
    };
  }
}
