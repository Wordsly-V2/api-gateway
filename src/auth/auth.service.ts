import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginResponse, OAuthUser } from './DTO/auth.DTO';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  async getHealth(): Promise<string> {
    return await firstValueFrom(this.authService.send('health', ''));
  }

  async handleOAuthLogin(user: OAuthUser): Promise<LoginResponse> {
    const loginResponse: LoginResponse = await firstValueFrom(
      this.authService.send('login_oauth', user),
    );

    return loginResponse;
  }
}
