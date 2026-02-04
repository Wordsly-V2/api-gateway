import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import { JwtAuthStrategy } from '@/common/guard/jwt-auth/jwt-auth.strategy';
import configuration from '@/config/configuration';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ErrorHandlerModule } from './error-handler/error-handler.module';
import { HttpClientsModule } from './http-clients/http-clients.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';

@Module({
    imports: [
        AuthModule,
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
        }),
        JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const secret = config.get('jwt.secret') as string;
                const expiresIn = config.get(
                    'jwt.expiresIn',
                ) as JwtSignOptions['expiresIn'];

                return {
                    secret,
                    signOptions: {
                        expiresIn: expiresIn,
                        algorithm: 'RS256',
                        issuer: 'api-gateway',
                    },
                };
            },
        }),
        ErrorHandlerModule,
        HttpClientsModule,
        VocabularyModule,
        UsersModule,
        CoursesModule,
    ],
    controllers: [AppController],
    providers: [AppService, JwtAuthStrategy],
})
export class AppModule {}
