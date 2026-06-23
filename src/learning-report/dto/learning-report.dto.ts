import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export type ReportPeriod = 'week' | 'month' | 'year';
export type ReportGranularity = 'day' | 'month';

export const REPORT_PERIODS: ReportPeriod[] = ['week', 'month', 'year'];

const CLIENT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class LearningReportQueryDto {
    @ApiPropertyOptional({
        description: 'Reporting window',
        enum: REPORT_PERIODS,
        default: 'week',
    })
    @IsOptional()
    @IsIn(REPORT_PERIODS)
    period?: ReportPeriod;

    @ApiPropertyOptional({
        description: 'Client local calendar date (YYYY-MM-DD)',
        example: '2026-06-23',
    })
    @IsOptional()
    @IsString()
    @Matches(CLIENT_DATE_PATTERN)
    clientDate?: string;
}

export class ReportRangeDto {
    @ApiProperty({ example: '2026-06-17' })
    start: string;

    @ApiProperty({ example: '2026-06-23' })
    end: string;
}

export class ReportBucketDto {
    @ApiProperty({ example: '2026-06-23' })
    key: string;

    @ApiProperty({ example: '2026-06-23' })
    start: string;

    @ApiProperty({ example: 12 })
    wordsPracticed: number;

    @ApiProperty({ example: 18 })
    reviews: number;

    @ApiProperty({ example: 15 })
    correctReviews: number;

    @ApiProperty({ example: 83.3, nullable: true })
    accuracy: number | null;

    @ApiProperty({ example: 1 })
    daysActive: number;

    @ApiProperty({ example: 1 })
    goalMetDays: number;

    @ApiProperty({ example: 5 })
    newWords: number;
}

export class ReportSummaryDto {
    @ApiProperty({ example: 84 })
    wordsLearned: number;

    @ApiProperty({ example: 120 })
    totalReviews: number;

    @ApiProperty({ example: 87.5 })
    avgAccuracy: number;

    @ApiProperty({ example: 6 })
    activeDays: number;

    @ApiProperty({ example: 5 })
    goalMetDays: number;

    @ApiProperty({ example: 20 })
    newWords: number;
}

export class ReportMasteryDto {
    @ApiProperty({ example: 30 })
    learningWords: number;

    @ApiProperty({ example: 45 })
    reviewWords: number;

    @ApiProperty({ example: 25 })
    masteredWords: number;

    @ApiProperty({ example: 100 })
    totalStarted: number;
}

export class ReportStreaksDto {
    @ApiProperty({ example: 6 })
    current: number;

    @ApiProperty({ example: 21 })
    longest: number;

    @ApiProperty({ example: 4 })
    goalStreak: number;

    @ApiProperty({ example: 14 })
    longestGoalStreak: number;
}

export class ReportAchievementDto {
    @ApiProperty({ example: 'streak-7' })
    key: string;

    @ApiProperty({ example: '7-day streak' })
    label: string;

    @ApiProperty({ enum: ['streak', 'words', 'days'], example: 'streak' })
    category: 'streak' | 'words' | 'days';

    @ApiProperty({ example: true })
    achieved: boolean;

    @ApiProperty({ example: 21 })
    value: number;

    @ApiProperty({ example: 7 })
    target: number;
}

export class LearningReportResponseDto {
    @ApiProperty({ enum: REPORT_PERIODS, example: 'week' })
    period: ReportPeriod;

    @ApiProperty({ enum: ['day', 'month'], example: 'day' })
    granularity: ReportGranularity;

    @ApiProperty({ type: ReportRangeDto })
    range: ReportRangeDto;

    @ApiProperty({ type: [ReportBucketDto] })
    buckets: ReportBucketDto[];

    @ApiProperty({ type: ReportSummaryDto })
    summary: ReportSummaryDto;

    @ApiProperty({ type: ReportMasteryDto })
    mastery: ReportMasteryDto;

    @ApiProperty({ type: ReportStreaksDto })
    streaks: ReportStreaksDto;

    @ApiProperty({ type: [ReportAchievementDto] })
    achievements: ReportAchievementDto[];
}
