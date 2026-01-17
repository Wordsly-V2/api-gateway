import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/health')
  getHealth(): Observable<string> {
    return this.authService.getHealth();
  }
}
