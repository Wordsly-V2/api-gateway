import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsISO8601,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    Max,
    Min,
    ArrayMaxSize,
    ValidateNested,
} from 'class-validator';

export enum AnswerQuality {
    COMPLETE_BLACKOUT = 0,
    INCORRECT = 1,
    INCORRECT_BUT_EASY = 2,
    CORRECT_WITH_DIFFICULTY = 3,
    CORRECT_WITH_HESITATION = 4,
    PERFECT = 5,
}

export class RecordAnswerDto {
    @ApiProperty({
        description: 'The ID of the word being reviewed',
        example: '01936b3e-7c8f-7890-abcd-ef1234567890',
    })
    @IsUUID()
    wordId: string;

    @ApiProperty({
        description: 'Quality of the answer (0-5)',
        enum: AnswerQuality,
        example: 4,
    })
    @IsEnum(AnswerQuality)
    quality: AnswerQuality;

    @ApiPropertyOptional({
        description:
            'ISO-8601 instant the user actually answered. Offline clients send the real answer time so scheduling happens from when the review occurred rather than from sync time. Clamped by learning-service.',
        example: '2026-08-11T14:03:22.117Z',
    })
    @IsOptional()
    @IsISO8601({ strict: true })
    reviewedAt?: string;
}

/** Max answers per bulk save; mirrors MAX_BULK_ANSWERS in learning-service. */
export const MAX_BULK_ANSWERS = 500;

export class BulkRecordAnswersDto {
    @ApiProperty({
        description: 'Array of word answers to record',
        type: [RecordAnswerDto],
    })
    @IsArray()
    @ArrayMaxSize(MAX_BULK_ANSWERS)
    @ValidateNested({ each: true })
    @Type(() => RecordAnswerDto)
    answers: RecordAnswerDto[];

    @ApiPropertyOptional({
        description:
            "Client local calendar date (YYYY-MM-DD) for the client's today. Used for the accuracy trend in the progress report.",
        example: '2026-06-23',
    })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    clientDate?: string;

    @ApiPropertyOptional({
        description:
            "Minutes to ADD to a UTC instant to get the user's local wall-clock time (i.e. -getTimezoneOffset()). Lets learning-service derive each answer's calendar date from its reviewedAt.",
        example: 420,
        minimum: -840,
        maximum: 840,
    })
    @IsOptional()
    @IsInt()
    @Min(-840)
    @Max(840)
    tzOffsetMinutes?: number;

    @ApiPropertyOptional({
        description:
            'Client-generated UUID identifying this flush. Replaying the same id returns the original response without re-applying XP or scheduling.',
        example: '01936b3e-7c8f-7890-abcd-ef1234567890',
    })
    @IsOptional()
    @IsUUID()
    clientRequestId?: string;
}

export class LevelEventDto {
    @ApiProperty({ description: 'Current numeric level', example: 7 })
    level: number;

    @ApiProperty({
        description: 'Named rank tier for the level',
        example: 'Apprentice',
    })
    rank: string;

    @ApiProperty({ description: 'Cumulative XP earned all-time', example: 430 })
    totalXp: number;

    @ApiProperty({
        description: 'XP earned within the current level',
        example: 130,
    })
    currentLevelXp: number;

    @ApiProperty({
        description: 'Total XP span of the current level',
        example: 200,
    })
    xpForThisLevel: number;

    @ApiProperty({
        description: 'XP still needed to reach the next level',
        example: 70,
    })
    xpToNextLevel: number;

    @ApiProperty({
        description: 'Progress through the current level, 0..100',
        example: 65,
    })
    progress: number;

    @ApiProperty({ description: 'XP earned by this action', example: 28 })
    xpEarned: number;

    @ApiProperty({
        description: 'Whether this action raised the level',
        example: true,
    })
    leveledUp: boolean;

    @ApiProperty({ description: 'Level before this action', example: 6 })
    previousLevel: number;
}

export class WordProgressResponseDto {
    @ApiProperty({
        description: 'Word progress ID',
        example: '01936b3e-7c8f-7890-abcd-ef1234567890',
    })
    id: string;

    @ApiProperty({
        description: 'Word ID',
        example: '01936b3e-7c8f-7890-abcd-ef1234567890',
    })
    wordId: string;

    @ApiProperty({
        description: 'User login ID',
        example: '01936b3e-7c8f-7890-abcd-ef1234567890',
    })
    userLoginId: string;

    @ApiProperty({
        description: 'Ease factor (difficulty)',
        example: 2.5,
    })
    @IsNumber()
    easeFactor: number;

    @ApiProperty({
        description: 'Interval in days until next review',
        example: 3,
    })
    @IsNumber()
    interval: number;

    @ApiProperty({
        description: 'Number of consecutive correct answers',
        example: 2,
    })
    @IsNumber()
    repetitions: number;

    @ApiPropertyOptional({
        description: 'Last review date',
        example: '2026-02-06T09:15:44.000Z',
    })
    lastReviewedAt?: Date;

    @ApiProperty({
        description: 'Next review date',
        example: '2026-02-09T09:15:44.000Z',
    })
    nextReviewAt: Date;

    @ApiProperty({
        description: 'Total number of reviews',
        example: 5,
    })
    @IsNumber()
    totalReviews: number;

    @ApiProperty({
        description: 'Number of correct reviews',
        example: 4,
    })
    @IsNumber()
    correctReviews: number;

    @ApiProperty({
        description: 'Success rate percentage',
        example: 80,
    })
    @IsNumber()
    successRate: number;

    @ApiPropertyOptional({
        description: 'FSRS state: 0=New 1=Learning 2=Review 3=Relearning',
        example: 2,
    })
    state?: number;

    @ApiPropertyOptional({
        description: 'Times the card has lapsed (Again on a Review card)',
        example: 1,
    })
    lapses?: number;

    @ApiPropertyOptional({
        description: 'Whether this card has lapsed past the leech threshold',
        example: false,
    })
    isLeech?: boolean;

    @ApiPropertyOptional({
        description:
            'When the card was suspended (withheld from reviews), if any',
        example: '2026-02-06T09:15:44.000Z',
        nullable: true,
    })
    suspendedAt?: Date | null;
}

export class BulkRecordAnswersResponseDto {
    @ApiProperty({
        description: 'Per-word progress after recording the session',
        type: [WordProgressResponseDto],
    })
    results: WordProgressResponseDto[];

    @ApiPropertyOptional({
        description:
            'XP/level result for the whole session so the client can celebrate a level-up.',
        type: LevelEventDto,
    })
    levelEvent?: LevelEventDto;

    @ApiProperty({
        description: 'Streak XP multiplier applied to this session (1 = none)',
        example: 1.25,
    })
    xpMultiplier: number;

    @ApiPropertyOptional({
        description:
            'True when this response was replayed from the idempotency ledger — nothing was applied, so the client must not re-animate XP.',
        example: false,
    })
    replayed?: boolean;
}

export class GetDueWordsQueryDto {
    @ApiPropertyOptional({
        description: 'Filter by specific course ID',
        example: '01936b3e-7c8f-7890-abcd-ef1234567890',
    })
    @IsOptional()
    @IsUUID()
    courseId?: string;

    @ApiPropertyOptional({
        description: 'Filter by specific lesson ID',
        example: '01936b3e-7c8f-7890-abcd-ef1234567890',
    })
    @IsOptional()
    @IsUUID()
    lessonId?: string;

    @ApiPropertyOptional({
        description: 'Maximum number of words to return',
        example: 20,
        default: 20,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional({
        description:
            'Maximum number of NEW (never-studied) words to include, independent of the due/review cap. Omit to fall back to legacy behaviour (new words fill whatever room `limit` leaves).',
        example: 5,
        minimum: 0,
        maximum: 100,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100)
    newLimit?: number;

    @ApiPropertyOptional({
        description: 'Include new words (not yet reviewed)',
        example: true,
        default: true,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return true;
    })
    @IsBoolean()
    includeNew?: boolean = true;

    @ApiPropertyOptional({
        description:
            'Client local calendar date (YYYY-MM-DD) used to count today’s new words/reviews against the daily pacing limits.',
        example: '2026-06-05',
    })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    clientDate?: string;
}

export class PacingInfoDto {
    @ApiProperty({ description: 'New words still allowed today', example: 5 })
    newWordsRemainingToday: number;

    @ApiProperty({ description: 'Reviews still allowed today', example: 80 })
    reviewsRemainingToday: number;

    @ApiProperty({
        description: 'Configured daily new-word limit',
        example: 10,
    })
    dailyNewWordLimit: number;

    @ApiProperty({ description: 'Configured daily review limit', example: 100 })
    dailyReviewLimit: number;
}

export class DueWordIdsResponseDto {
    @ApiProperty({
        description:
            'List of word IDs that are due for review (same order as due-words API)',
        type: [String],
        example: [
            '01936b3e-7c8f-7890-abcd-ef1234567890',
            '01936b3e-7c8f-7890-abcd-ef1234567891',
        ],
    })
    wordIds: string[];

    @ApiPropertyOptional({
        description: 'Remaining daily pacing budget after this request',
        type: PacingInfoDto,
    })
    pacing?: PacingInfoDto;
}

export class StatsByWordIdsDto {
    @ApiProperty({ description: 'Word IDs', type: [String] })
    @IsArray()
    @IsUUID(undefined, { each: true })
    wordIds: string[];
}

export class ScopeWordIdsDto {
    @ApiProperty({ description: 'Scope ID (course or lesson)', type: String })
    @IsUUID()
    scopeId: string;

    @ApiProperty({ description: 'Word IDs in scope', type: [String] })
    @IsArray()
    @IsUUID(undefined, { each: true })
    wordIds: string[];
}

export class StatsByScopesDto {
    @ApiProperty({
        description: 'Scopes with word IDs',
        type: [ScopeWordIdsDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ScopeWordIdsDto)
    scopes: ScopeWordIdsDto[];
}

export class GetDueWordIdsByWordIdsDto {
    @ApiProperty({ description: 'Word IDs in scope', type: [String] })
    @IsArray()
    @IsUUID(undefined, { each: true })
    wordIds: string[];

    @ApiPropertyOptional({
        description: 'Maximum number of words to return',
        example: 20,
        default: 20,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional({
        description:
            'Maximum number of NEW (never-studied) words to include, independent of the due/review cap. Omit to fall back to legacy behaviour (new words fill whatever room `limit` leaves).',
        example: 5,
        minimum: 0,
        maximum: 100,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100)
    newLimit?: number;

    @ApiPropertyOptional({
        description: 'Include new words (not yet reviewed)',
        example: true,
        default: true,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return true;
    })
    @IsBoolean()
    includeNew?: boolean = true;

    @ApiPropertyOptional({
        description:
            'Client local calendar date (YYYY-MM-DD) used to count today’s new words/reviews against the daily pacing limits.',
        example: '2026-06-05',
    })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    clientDate?: string;
}

export class ByCourseIdsDto {
    @ApiProperty({ description: 'Course IDs', type: [String] })
    @IsArray()
    @IsUUID(undefined, { each: true })
    courseIds: string[];
}

export class ByLessonIdsDto {
    @ApiProperty({ description: 'Lesson IDs', type: [String] })
    @IsArray()
    @IsUUID(undefined, { each: true })
    lessonIds: string[];
}

export class ByWordIdsDto {
    @ApiProperty({ description: 'Word IDs', type: [String] })
    @IsArray()
    @IsUUID(undefined, { each: true })
    wordIds: string[];
}

export class WordProgressStatsDto {
    @ApiProperty({
        description: 'Total words in learning',
        example: 150,
    })
    totalWords: number;

    @ApiProperty({
        description: 'New words not yet reviewed',
        example: 30,
    })
    newWords: number;

    @ApiProperty({
        description: 'Words currently in learning phase',
        example: 45,
    })
    learningWords: number;

    @ApiProperty({
        description: 'Words in review phase',
        example: 75,
    })
    reviewWords: number;

    @ApiProperty({
        description: 'Words due for review today',
        example: 20,
    })
    dueToday: number;

    @ApiProperty({
        description: 'Overall success rate percentage',
        example: 85.5,
    })
    overallSuccessRate: number;
}

export class LeechesQueryDto {
    @ApiPropertyOptional({
        description: 'Filter by specific course ID',
        example: '01936b3e-7c8f-7890-abcd-ef1234567890',
    })
    @IsOptional()
    @IsUUID()
    courseId?: string;

    @ApiPropertyOptional({
        description: 'Filter by specific lesson ID',
        example: '01936b3e-7c8f-7890-abcd-ef1234567890',
    })
    @IsOptional()
    @IsUUID()
    lessonId?: string;
}

export class LeechItemDto {
    @ApiProperty({
        description: 'Word ID',
        example: '01936b3e-7c8f-7890-abcd-ef1234567890',
    })
    wordId: string;

    @ApiProperty({ description: 'Times the card has lapsed', example: 9 })
    lapses: number;

    @ApiProperty({ description: 'FSRS state', example: 3 })
    state: number;

    @ApiProperty({ description: 'Total reviews', example: 20 })
    totalReviews: number;

    @ApiProperty({ description: 'Correct reviews', example: 8 })
    correctReviews: number;

    @ApiProperty({ description: 'Success rate percentage', example: 40 })
    successRate: number;

    @ApiPropertyOptional({
        description: 'When suspended, if suspended',
        nullable: true,
    })
    suspendedAt?: Date | null;

    @ApiProperty({ description: 'Next review date' })
    nextReviewAt: Date;
}

export class LeechesResponseDto {
    @ApiProperty({
        description: 'Leech cards, most-lapsed first',
        type: [LeechItemDto],
    })
    leeches: LeechItemDto[];
}
