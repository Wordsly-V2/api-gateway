import { Module } from '@nestjs/common';
import { LearningSettingsController } from './learning-settings.controller';
import { LearningSettingsService } from './learning-settings.service';

@Module({
    providers: [LearningSettingsService],
    controllers: [LearningSettingsController],
})
export class LearningSettingsModule {}
