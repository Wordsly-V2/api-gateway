import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';
import { KAFKA_CLIENT, KafkaService } from './kafka.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: KAFKA_CLIENT,
            useFactory: (config: ConfigService) => {
                const brokers = config.get<string>('kafka.brokers') ?? '';
                const ca = config.get<string>('kafka.ca') ?? '';
                const cert = config.get<string>('kafka.cert') ?? '';
                const key = config.get<string>('kafka.key') ?? '';

                return new Kafka({
                    clientId: 'api-gateway',
                    brokers: brokers
                        .split(',')
                        .map((b) => b.trim())
                        .filter(Boolean),
                    ssl: {
                        rejectUnauthorized: true,
                        ca,
                        cert,
                        key,
                    },
                });
            },
            inject: [ConfigService],
        },
        KafkaService,
    ],
    exports: [KafkaService],
})
export class KafkaModule {}
