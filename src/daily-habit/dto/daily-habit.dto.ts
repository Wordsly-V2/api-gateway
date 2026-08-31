import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';

export const DAILY_GOAL_WORDS = 10;
export const DAILY_GOAL_MIN = 5;
export const DAILY_GOAL_MAX = 50;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class DailyHabitQueryDto {
    @ApiPropertyOptional({
        description: 'Client local calendar date (YYYY-MM-DD)',
        example: '2026-06-05',
    })
    @IsOptional()
    @IsString()
    @Matches(DATE_PATTERN)
    clientDate?: string;
}

export class RecordDailyPracticeDto {
    @ApiProperty({
        description: 'Number of words practiced in this session',
        example: 5,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    wordCount: number;

    @ApiProperty({
        description: 'Client local calendar date (YYYY-MM-DD)',
        example: '2026-06-05',
    })
    @IsString()
    @Matches(DATE_PATTERN)
    clientDate: string;
}

/** Distinct calendar days one batched flush may cover. */
export const MAX_BATCH_PRACTICE_DAYS = 60;

export class DailyPracticeDayDto {
    @ApiProperty({
        description: 'Client local calendar date (YYYY-MM-DD)',
        example: '2026-08-11',
    })
    @IsString()
    @Matches(DATE_PATTERN)
    clientDate: string;

    @ApiProperty({
        description: 'Words practiced on that day',
        example: 12,
        minimum: 1,
        maximum: 1000,
    })
    @IsInt()
    @Min(1)
    @Max(1000)
    wordCount: number;
}

export class BatchRecordDailyPracticeDto {
    @ApiProperty({
        description:
            'One entry per local calendar day held offline. Duplicate dates are summed.',
        type: [DailyPracticeDayDto],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(MAX_BATCH_PRACTICE_DAYS)
    @ValidateNested({ each: true })
    @Type(() => DailyPracticeDayDto)
    days: DailyPracticeDayDto[];

    @ApiProperty({
        description:
            "The client's TODAY — anchors wordsToday, practiceDate and streak decay.",
        example: '2026-08-13',
    })
    @IsString()
    @Matches(DATE_PATTERN)
    clientDate: string;

    @ApiPropertyOptional({
        description:
            'Client-generated UUID identifying this flush. Replaying the same id returns the original response without re-applying XP.',
        example: '01936b3e-7c8f-7890-abcd-ef1234567890',
    })
    @IsOptional()
    @IsUUID()
    clientRequestId?: string;
}

export class UpdateDailyGoalDto {
    @ApiProperty({
        description: 'Daily word goal',
        example: 15,
        minimum: DAILY_GOAL_MIN,
        maximum: DAILY_GOAL_MAX,
    })
    @IsInt()
    @Min(DAILY_GOAL_MIN)
    @Max(DAILY_GOAL_MAX)
    dailyGoal: number;
}

export class UnlockedAchievementDto {
    @ApiProperty({ description: 'Achievement key', example: 'streak-7' })
    key: string;

    @ApiProperty({ description: 'Human label', example: '7-day streak' })
    label: string;

    @ApiProperty({
        description: 'Category',
        example: 'streak',
        enum: ['streak', 'words', 'days'],
    })
    category: 'streak' | 'words' | 'days';

    @ApiProperty({ description: 'XP awarded for the unlock', example: 57 })
    xpAwarded: number;

    @ApiProperty({
        description: 'Whether a streak freeze was granted',
        example: true,
    })
    streakFreezeAwarded: boolean;

    @ApiProperty({ description: 'When it was unlocked' })
    unlockedAt: Date;
}

export class DailyHabitDayDto {
    @ApiProperty({ example: '2026-06-05' })
    date: string;

    @ApiProperty({ example: 12 })
    words: number;

    @ApiProperty({ example: true })
    goalMet: boolean;

    @ApiProperty({
        description:
            'No practice, but a banked streak freeze covered the day — the streak survived it',
        example: false,
    })
    frozen: boolean;
}

export class DailyHabitResponseDto {
    @ApiProperty({ example: '2026-06-05' })
    date: string;

    @ApiProperty({ example: 7 })
    wordsToday: number;

    @ApiProperty({ example: 3 })
    streak: number;

    @ApiProperty({ example: 12 })
    longestStreak: number;

    @ApiProperty({ example: 2 })
    goalStreak: number;

    @ApiProperty({ example: 5 })
    longestGoalStreak: number;

    @ApiPropertyOptional({ example: '2026-06-05', nullable: true })
    lastPracticeDate: string | null;

    @ApiProperty({ example: 10 })
    goal: number;

    @ApiProperty({ example: false })
    goalMetToday: boolean;

    @ApiProperty({ example: 240 })
    totalWordsPracticed: number;

    @ApiProperty({
        description: 'Days with any practice, all time',
        example: 18,
    })
    totalPracticeDays: number;

    @ApiProperty({
        description: 'Days the daily goal was completed, all time',
        example: 15,
    })
    totalGoalDays: number;

    @ApiProperty({ example: 42 })
    wordsThisWeek: number;

    @ApiProperty({ example: 5 })
    daysActiveThisWeek: number;

    @ApiProperty({ type: [DailyHabitDayDto] })
    recentDays: DailyHabitDayDto[];

    @ApiProperty({ example: 'Almost there — 2 more words to hit your goal.' })
    message: string;

    @ApiPropertyOptional({
        description: 'Achievements unlocked by this practice, if any',
        type: [UnlockedAchievementDto],
    })
    unlockedAchievements?: UnlockedAchievementDto[];
}
