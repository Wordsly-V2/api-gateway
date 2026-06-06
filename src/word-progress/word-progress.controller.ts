import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    BulkRecordAnswersDto,
    ByCourseIdsDto,
    ByLessonIdsDto,
    ByWordIdsDto,
    DueWordIdsResponseDto,
    GetDueWordIdsByWordIdsDto,
    GetDueWordsQueryDto,
    RecordAnswerAcceptedDto,
    RecordAnswerDto,
    StatsByScopesDto,
    StatsByWordIdsDto,
    WordProgressResponseDto,
    WordProgressStatsDto,
} from './dto/word-progress.dto';
import { WordProgressService } from './word-progress.service';

@ApiTags('word-progress')
@Controller('word-progress')
@UseGuards(JwtAuthGuard)
export class WordProgressController {
    constructor(private readonly vocabularyService: WordProgressService) {}

    @Post('record-answer')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({
        summary: 'Record an answer for a word',
        description:
            "Records the user's answer quality and updates the spaced repetition schedule",
    })
    @ApiBody({ type: RecordAnswerDto })
    @ApiResponse({
        status: 202,
        description: 'Answer accepted for processing',
        type: RecordAnswerAcceptedDto,
    })
    recordAnswer(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: RecordAnswerDto,
    ): Promise<RecordAnswerAcceptedDto> {
        return this.vocabularyService.recordAnswer(req.user.userLoginId, body);
    }

    @Post('record-answer/bulk')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({
        summary: 'Record multiple answers (bulk)',
        description:
            'Records multiple word answers in one Kafka message for async batch processing.',
    })
    @ApiBody({ type: BulkRecordAnswersDto })
    @ApiResponse({
        status: 202,
        description: 'Answers accepted for processing',
        type: RecordAnswerAcceptedDto,
    })
    recordAnswerBulk(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: BulkRecordAnswersDto,
    ): Promise<RecordAnswerAcceptedDto> {
        return this.vocabularyService.recordAnswerBulk(
            req.user.userLoginId,
            body,
        );
    }

    @Post('record-answer/bulk-sync')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Record multiple answers synchronously (bulk)',
        description:
            'Persists all answers in one transaction and returns updated progress. Preferred for session saves.',
    })
    @ApiBody({ type: BulkRecordAnswersDto })
    @ApiResponse({
        status: 200,
        description: 'Answers recorded successfully',
        type: [WordProgressResponseDto],
    })
    recordAnswerBulkSync(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: BulkRecordAnswersDto,
    ): Promise<WordProgressResponseDto[]> {
        return this.vocabularyService.recordAnswerBulkSync(
            req.user.userLoginId,
            body,
        );
    }

    @Get('due-word-ids')
    @ApiOperation({
        summary: 'Get IDs of words due for review',
        description:
            'Same as due-words but returns only a list of word IDs. Uses the same filters (courseId, lessonId, limit, includeNew) and ordering.',
    })
    @ApiParam({
        name: 'userLoginId',
        description: 'User login ID',
        example: 'user123',
    })
    @ApiQuery({
        name: 'courseId',
        required: false,
        type: String,
        description: 'Filter by specific course',
    })
    @ApiQuery({
        name: 'lessonId',
        required: false,
        type: String,
        description: 'Filter by specific lesson',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Maximum number of word IDs to return (1-100)',
        example: 20,
    })
    @ApiQuery({
        name: 'includeNew',
        required: false,
        type: Boolean,
        description: 'Include new words not yet reviewed',
        example: true,
    })
    @ApiResponse({
        status: 200,
        description: 'Due word IDs retrieved successfully',
        type: DueWordIdsResponseDto,
    })
    async getDueWordIds(
        @Req() req: Request & { user: JwtAuthPayload },
        @Query() query: GetDueWordsQueryDto,
    ): Promise<DueWordIdsResponseDto> {
        const wordIds = await this.vocabularyService.getDueWordIds(
            req.user.userLoginId,
            query,
        );
        return wordIds;
    }

    @Post('stats')
    @ApiOperation({
        summary: 'Get progress stats for word IDs',
    })
    @ApiBody({ type: StatsByWordIdsDto })
    getProgressStatsByWordIds(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: StatsByWordIdsDto,
    ): Promise<WordProgressStatsDto> {
        return this.vocabularyService.getProgressStatsByWordIds(
            req.user.userLoginId,
            body.wordIds,
        );
    }

    @Post('stats/by-scopes')
    @ApiOperation({
        summary: 'Get progress stats keyed by scope ID',
    })
    @ApiBody({ type: StatsByScopesDto })
    getProgressStatsByScopes(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: StatsByScopesDto,
    ): Promise<Record<string, WordProgressStatsDto>> {
        return this.vocabularyService.getProgressStatsByScopes(
            req.user.userLoginId,
            body.scopes,
        );
    }

    @Post('due-word-ids/by-word-ids')
    @ApiOperation({
        summary: 'Get due word IDs within a provided word ID list',
    })
    @ApiBody({ type: GetDueWordIdsByWordIdsDto })
    getDueWordIdsByWordIds(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: GetDueWordIdsByWordIdsDto,
    ): Promise<DueWordIdsResponseDto> {
        return this.vocabularyService.getDueWordIdsByWordIds(
            req.user.userLoginId,
            body.wordIds,
            body.limit,
            body.includeNew,
        );
    }

    @Post('stats/by-course-ids')
    @ApiOperation({
        summary: 'Get progress stats keyed by course ID',
    })
    @ApiBody({ type: ByCourseIdsDto })
    getProgressStatsByCourseIds(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: ByCourseIdsDto,
    ): Promise<Record<string, WordProgressStatsDto>> {
        return this.vocabularyService.getProgressStatsByCourseIds(
            req.user.userLoginId,
            body.courseIds,
        );
    }

    @Post('stats/by-lesson-ids')
    @ApiOperation({
        summary: 'Get progress stats keyed by lesson ID',
    })
    @ApiBody({ type: ByLessonIdsDto })
    getProgressStatsByLessonIds(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: ByLessonIdsDto,
    ): Promise<Record<string, WordProgressStatsDto>> {
        return this.vocabularyService.getProgressStatsByLessonIds(
            req.user.userLoginId,
            body.lessonIds,
        );
    }

    @Post('by-word-ids')
    @ApiOperation({
        summary: 'Get progress keyed by word ID',
    })
    @ApiBody({ type: ByWordIdsDto })
    getProgressByWordIds(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: ByWordIdsDto,
    ): Promise<Record<string, WordProgressResponseDto | null>> {
        return this.vocabularyService.getProgressByWordIds(
            req.user.userLoginId,
            body.wordIds,
        );
    }

    @Get('stats')
    @ApiOperation({
        summary: 'Get learning progress statistics',
        description:
            "Retrieves comprehensive statistics about the user's learning progress",
    })
    @ApiQuery({
        name: 'courseId',
        required: false,
        type: String,
        description: 'Filter by specific course',
    })
    @ApiQuery({
        name: 'lessonId',
        required: false,
        type: String,
        description: 'Filter by specific lesson',
    })
    @ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        type: WordProgressStatsDto,
    })
    getProgressStats(
        @Req() req: Request & { user: JwtAuthPayload },
        @Query('courseId') courseId?: string,
        @Query('lessonId') lessonId?: string,
    ): Promise<WordProgressStatsDto> {
        return this.vocabularyService.getProgressStats(
            req.user.userLoginId,
            courseId,
            lessonId,
        );
    }

    @Get('words/:wordId')
    @ApiOperation({
        summary: 'Get progress for a specific word',
        description:
            'Retrieves the learning progress details for a single word',
    })
    @ApiParam({
        name: 'wordId',
        description: 'Word ID',
        example: '01936b3e-7c8f-7890-abcd-ef1234567890',
    })
    @ApiResponse({
        status: 200,
        description: 'Word progress retrieved successfully',
        type: WordProgressResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Progress not found for this word',
    })
    getWordProgress(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('wordId') wordId: string,
    ): Promise<WordProgressResponseDto | null> {
        return this.vocabularyService.getWordProgress(
            req.user.userLoginId,
            wordId,
        );
    }

    @Delete('words/bulk-reset')
    @ApiOperation({
        summary: 'Reset progress for multiple words (bulk)',
        description:
            'Deletes learning progress for the given word IDs. Only words in the user\'s courses are reset.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['wordIds'],
            properties: { wordIds: { type: 'array', items: { type: 'string', format: 'uuid' } } },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Progress reset; returns count of reset items',
        schema: { type: 'object', properties: { count: { type: 'number' } } },
    })
    resetProgressBulk(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: { wordIds: string[] },
    ): Promise<{ count: number }> {
        return this.vocabularyService.resetProgressBulk(
            req.user.userLoginId,
            body.wordIds ?? [],
        );
    }

    @Delete('words/:wordId/reset')
    @ApiOperation({
        summary: 'Reset progress for a specific word',
        description:
            'Deletes all learning progress for a word, allowing the user to start fresh',
    })
    @ApiParam({
        name: 'wordId',
        description: 'Word ID',
        example: '01936b3e-7c8f-7890-abcd-ef1234567890',
    })
    @ApiResponse({
        status: 200,
        description: 'Progress reset successfully',
    })
    @ApiResponse({
        status: 404,
        description: 'Word not found or access denied',
    })
    resetProgress(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('wordId') wordId: string,
    ): Promise<{ success: boolean }> {
        return this.vocabularyService.resetProgress(
            req.user.userLoginId,
            wordId,
        );
    }
}
