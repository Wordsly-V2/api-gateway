import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import {
    Body,
    Controller,
    Delete,
    Get,
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
    DueWordIdsResponseDto,
    GetDueWordsQueryDto,
    RecordAnswerDto,
    WordProgressResponseDto,
    WordProgressStatsDto,
} from './dto/word-progress.dto';
import { VocabularyService } from './vocabulary.service';

@ApiTags('vocabulary/word-progress')
@Controller('vocabulary')
@UseGuards(JwtAuthGuard)
export class VocabularyController {
    constructor(private readonly vocabularyService: VocabularyService) {}

    @Post('word-progress/record-answer')
    @ApiOperation({
        summary: 'Record an answer for a word',
        description:
            "Records the user's answer quality and updates the spaced repetition schedule",
    })
    @ApiBody({ type: RecordAnswerDto })
    @ApiResponse({
        status: 200,
        description: 'Answer recorded successfully',
        type: WordProgressResponseDto,
    })
    recordAnswer(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: RecordAnswerDto,
    ): Promise<WordProgressResponseDto> {
        return this.vocabularyService.recordAnswer(req.user.userLoginId, body);
    }

    @Post('word-progress/record-answers')
    @ApiOperation({
        summary: 'Record multiple answers in bulk',
        description:
            'Records multiple word answers at once for better performance',
    })
    @ApiBody({ type: BulkRecordAnswersDto })
    @ApiResponse({
        status: 200,
        description: 'Answers recorded successfully',
        type: [WordProgressResponseDto],
    })
    recordAnswers(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: BulkRecordAnswersDto,
    ): Promise<WordProgressResponseDto[]> {
        return this.vocabularyService.recordAnswers(req.user.userLoginId, body);
    }

    @Get('word-progress/due-word-ids')
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

    @Get('word-progress/stats')
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

    @Get('word-progress/words/:wordId')
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

    @Delete('word-progress/words/:wordId/reset')
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
