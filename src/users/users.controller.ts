import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { IUser } from '@/users/dto/users.dto';
import { UsersService } from '@/users/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  myProfile(@Req() req: Request & { user: JwtAuthPayload }): Promise<IUser> {
    return this.usersService.getProfile(req.user.userLoginId);
  }
}
