import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Global()
@Module({
  providers: [
    {
      provide: 'AUTH_SERVICE_HTTP',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const token = config.get('authService.internalToken') as string;
        const timeout = config.get('authService.httpTimeout') as number;
        const baseURL = config.get('authService.host') as string;

        return axios.create({
          timeout,
          baseURL,
          headers: { 'x-service-token': token },
        });
      },
    },
    {
      provide: 'VOCABULARY_SERVICE_HTTP',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const token = config.get('vocabularyService.internalToken') as string;
        const timeout = config.get('vocabularyService.httpTimeout') as number;
        const baseURL = config.get('vocabularyService.host') as string;

        return axios.create({
          timeout,
          baseURL,
          headers: { 'x-service-token': token },
        });
      },
    },
  ],
  exports: ['AUTH_SERVICE_HTTP', 'VOCABULARY_SERVICE_HTTP'],
})
export class HttpClientsModule {}
