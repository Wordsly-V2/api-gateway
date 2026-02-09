import { Module } from '@nestjs/common';
import { WordProgressService } from './word-progress.service';
import { WordProgressController } from './word-progress.controller';

@Module({
    providers: [WordProgressService],
    controllers: [WordProgressController],
})
export class WordProgressModule {}
