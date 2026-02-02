import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { GoogleStrategy } from '@/auth/strategy/google.strategy';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AuthController],
  imports: [],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
