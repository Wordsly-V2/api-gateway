import { Module } from '@nestjs/common';
import { LearningReportController } from './learning-report.controller';
import { LearningReportService } from './learning-report.service';

@Module({
    providers: [LearningReportService],
    controllers: [LearningReportController],
})
export class LearningReportModule {}
