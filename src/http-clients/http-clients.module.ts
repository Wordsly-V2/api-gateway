import http from 'node:http';
import https from 'node:https';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

// Keep-alive agents reuse downstream TCP connections instead of paying a new
// handshake per proxied request; shared across the three service clients.
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 100 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 100 });

const createServiceClient = (
    config: ConfigService,
    serviceKey: 'authService' | 'vocabularyService' | 'learningService',
): AxiosInstance => {
    const token = config.get(`${serviceKey}.internalToken`) as string;
    const timeout = config.get(`${serviceKey}.httpTimeout`) as number;
    const baseURL = config.get(`${serviceKey}.host`) as string;

    return axios.create({
        timeout,
        baseURL,
        headers: { 'x-service-token': token },
        httpAgent,
        httpsAgent,
    });
};

@Global()
@Module({
    providers: [
        {
            provide: 'AUTH_SERVICE_HTTP',
            inject: [ConfigService],
            useFactory: (config: ConfigService) =>
                createServiceClient(config, 'authService'),
        },
        {
            provide: 'VOCABULARY_SERVICE_HTTP',
            inject: [ConfigService],
            useFactory: (config: ConfigService) =>
                createServiceClient(config, 'vocabularyService'),
        },
        {
            provide: 'LEARNING_SERVICE_HTTP',
            inject: [ConfigService],
            useFactory: (config: ConfigService) =>
                createServiceClient(config, 'learningService'),
        },
    ],
    exports: [
        'AUTH_SERVICE_HTTP',
        'VOCABULARY_SERVICE_HTTP',
        'LEARNING_SERVICE_HTTP',
    ],
})
export class HttpClientsModule {}
