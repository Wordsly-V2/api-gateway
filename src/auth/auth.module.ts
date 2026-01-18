import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  controllers: [AuthController],
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
          console.log('authService address: ', process.env.AUTH_SERVICE_HOST);

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
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
