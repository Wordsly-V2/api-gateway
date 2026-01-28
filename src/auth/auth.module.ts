import { Module } from '@nestjs/common';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from '@/auth/strategy/google.strategy';
import { UsersController } from '@/auth/users/users.controller';
import { UsersService } from '@/auth/users/users.service';

@Module({
  controllers: [AuthController, UsersController],
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const host = config.get('authService.host') as string;
          const port = config.get('authService.port') as number;

          console.log('authService address: ', { host, port });

          return {
            transport: Transport.TCP,
            options: {
              host,
              port,
            },
          };
        },
      },
    ]),
  ],
  providers: [AuthService, GoogleStrategy, UsersService],
})
export class AuthModule {}
