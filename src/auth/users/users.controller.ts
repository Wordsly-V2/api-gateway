import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { IUser } from '@/auth/users/dto/users.dto';
import { UsersService } from '@/auth/users/users.service';

@Controller('auth/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Req() req: Request & { user: JwtAuthPayload }): Promise<IUser> {
    return this.usersService.getProfile(req.user.userLoginId);
  }
}
