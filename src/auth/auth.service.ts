import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { IOAuthLoginResponseDTO, IOAuthUserDTO } from './DTO/auth.DTO';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  getHealth(): Observable<string> {
    return this.authService.send('health', '');
  }

  handleOAuthLogin(user: IOAuthUserDTO): Observable<IOAuthLoginResponseDTO> {
    return this.authService.send('login_oauth', user);
  }
}
