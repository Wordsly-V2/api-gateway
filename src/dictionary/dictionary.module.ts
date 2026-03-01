import { KafkaModule } from '@/kafka/kafka.module';
import { Module } from '@nestjs/common';
import { DictionaryController } from './dictionary.controller';
import { DictionaryService } from './dictionary.service';

@Module({
    imports: [KafkaModule],
    providers: [DictionaryService],
    controllers: [DictionaryController],
})
export class DictionaryModule {}
