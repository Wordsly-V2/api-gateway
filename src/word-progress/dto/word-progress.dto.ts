import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
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
}

export class BulkRecordAnswersDto {
    @ApiProperty({
        description: 'Array of word answers to record',
        type: [RecordAnswerDto],
    })
    @IsArray()
    @ArrayMaxSize(200)
    @ValidateNested({ each: true })
    @Type(() => RecordAnswerDto)
    answers: RecordAnswerDto[];

    @ApiPropertyOptional({
        description:
            'Client local calendar date (YYYY-MM-DD) the session happened on. Used for the accuracy trend in the progress report.',
        example: '2026-06-23',
    })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    clientDate?: string;
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
    @ApiProperty({ description: 'Scopes with word IDs', type: [ScopeWordIdsDto] })
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
