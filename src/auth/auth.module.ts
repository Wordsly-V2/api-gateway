import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { GoogleStrategy } from '@/auth/strategy/google.strategy';
import { UsersController } from '@/auth/users/users.controller';
import { UsersService } from '@/auth/users/users.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AuthController, UsersController],
  imports: [],
  providers: [AuthService, GoogleStrategy, UsersService],
})
export class AuthModule {}
