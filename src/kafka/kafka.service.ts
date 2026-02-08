import {
    Inject,
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import type { Kafka, Producer, RecordMetadata } from 'kafkajs';

export const KAFKA_CLIENT = 'KAFKA_CLIENT';

export interface KafkaEmitOptions {
    /** Topic to emit to */
    topic: string;
    /** Message payload (will be JSON-serialized if object) */
    payload: unknown;
    /** Optional key for partitioning */
    key?: string;
    /** Optional message headers */
    headers?: Record<string, string>;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(KafkaService.name);
    private producer: Producer | null = null;

    constructor(@Inject(KAFKA_CLIENT) private readonly kafka: Kafka) {}

    async onModuleInit() {
        this.producer = this.kafka.producer();
        await this.producer.connect();
        this.logger.log('Kafka producer connected');
    }

    async onModuleDestroy() {
        if (this.producer) {
            await this.producer.disconnect();
            this.producer = null;
            this.logger.log('Kafka producer disconnected');
        }
    }

    /**
     * Send a single message to a topic.
     * Payload is JSON-serialized if it's an object.
     */
    async sendMessage(
        topic: string,
        message: unknown,
    ): Promise<RecordMetadata[]> {
        this.ensureProducer();
        const value =
            typeof message === 'string' ? message : JSON.stringify(message);
        return this.producer!.send({
            topic,
            messages: [{ value }],
        });
    }

    /**
     * Emit a message with full options (topic, payload, key, headers).
     * Use this when you need partitioning key or headers.
     */
    async emit(options: KafkaEmitOptions): Promise<RecordMetadata[]> {
        this.ensureProducer();
        const { topic, payload, key, headers } = options;
        const value =
            typeof payload === 'string' ? payload : JSON.stringify(payload);
        return this.producer!.send({
            topic,
            messages: [
                {
                    value,
                    ...(key != null && { key }),
                    ...(headers &&
                        Object.keys(headers).length > 0 && {
                            headers: this.stringifyHeaders(headers),
                        }),
                },
            ],
        });
    }

    private ensureProducer(): void {
        if (!this.producer) {
            throw new Error(
                'Kafka producer is not connected. Ensure KafkaModule is initialized.',
            );
        }
    }

    private stringifyHeaders(
        headers: Record<string, string>,
    ): Record<string, string> {
        return Object.fromEntries(
            Object.entries(headers).map(([k, v]) => [k, String(v)]),
        );
    }
}
