import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { JwtAuthPayload } from '../DTO/auth.dto';
import { IUser } from './DTO/users.dto';
import { UsersService } from './users.service';

@Controller('auth/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Req() req: Request & { user: JwtAuthPayload }): Promise<IUser> {
    return this.usersService.getProfile(req.user.userLoginId);
  }
}
