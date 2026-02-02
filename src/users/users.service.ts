import { IUser } from '@/users/dto/users.dto';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';

@Injectable()
export class UsersService {
  constructor(
    @Inject('AUTH_SERVICE_HTTP')
    private readonly authServiceHttp: AxiosInstance,
  ) {}

  async getProfile(userLoginId: string): Promise<IUser> {
    try {
      const response = await this.authServiceHttp.get<IUser>(
        `/users/${userLoginId}/profile`,
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to get profile', { cause: error });
    }
  }
}
