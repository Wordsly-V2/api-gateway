import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IUser } from './DTO/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  getProfile(userLoginId: string): Promise<IUser> {
    return firstValueFrom(
      this.authService.send('users.get_profile', userLoginId),
    );
  }
}
