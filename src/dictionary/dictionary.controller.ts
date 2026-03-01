import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { DictionaryService } from './dictionary.service';
import {
    DictionarySearchResultDto,
    LangeekWordDetailsDto,
    SyncWordsLangeekDto,
} from './dto/dctionary.dto';

@Controller('dictionary')
@UseGuards(JwtAuthGuard)
export class DictionaryController {
    constructor(private readonly dictionaryService: DictionaryService) {}

    @Get('pronunciation/:word')
    @ApiOperation({
        summary: 'Get pronunciation and IPA for a word',
        description: 'Gets pronunciation (audio URLs) and UK/US IPA for a word',
    })
    @ApiParam({
        name: 'word',
        description: 'Word to get pronunciation for',
    })
    @ApiResponse({
        status: 200,
        description: 'Pronunciation and IPA data',
    })
    getPronunciation(@Param('word') word: string): Promise<{
        pronunciation: { type: string; url: string }[];
        ipas: { partOfSpeech: string; uk: string | null; us: string | null }[];
    }> {
        return this.dictionaryService.getPronunciation(word);
    }

    @Get('search/:word')
    @ApiOperation({
        summary: 'Search for words',
        description: 'Searches for words in the dictionary',
    })
    @ApiParam({
        name: 'word',
        description: 'Word to search for',
    })
    @ApiResponse({
        status: 200,
        description: 'Words searched successfully',
        type: [DictionarySearchResultDto],
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid word format',
    })
    searchWords(
        @Param('word') word: string,
    ): Promise<DictionarySearchResultDto[]> {
        return this.dictionaryService.searchWords(word);
    }

    @Get('word-details/:langeekWordId')
    @ApiOperation({
        summary: 'Get word details from Langeek dictionary',
        description:
            'Fetches full word details from dictionary.langeek.co using the word ID from search results.',
    })
    @ApiParam({
        name: 'langeekWordId',
        description: 'Langeek word entry ID (from search results)',
        example: 2707,
    })
    @ApiQuery({
        name: 'entry',
        description:
            'Word text (e.g. from search result), required for the Langeek URL',
        example: 'admire',
    })
    @ApiResponse({
        status: 200,
        description:
            'Structured word details (word, meaning, partOfSpeech, pronunciation, audioUrl, examples)',
        type: LangeekWordDetailsDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Word details not found',
    })
    async getLangeekWordDetails(
        @Param('langeekWordId', new ParseIntPipe()) langeekWordId: number,
    ) {
        return this.dictionaryService.getLangeekWordDetails(langeekWordId);
    }

    @Get('examples/:word')
    @ApiOperation({
        summary: 'Get examples for a word',
        description: 'Gets the examples for a word',
    })
    @ApiParam({
        name: 'word',
        description: 'Word to get examples for',
    })
    getExamples(@Param('word') word: string): Promise<string[]> {
        return this.dictionaryService.getExamples(word);
    }

    @Get('my-words/search/:word')
    @ApiOperation({
        summary: 'Get examples for a word',
        description: 'Gets the examples for a word',
    })
    @ApiParam({
        name: 'word',
        description: 'Word to get examples for',
    })
    searchUserWords(
        @Req() req: Request & { user: JwtAuthPayload },
        @Param('word') word: string,
    ): Promise<string[]> {
        return this.dictionaryService.searchUserWords(
            req.user.userLoginId,
            word,
        );
    }

    @Post('sync-words-langeek')
    @ApiOperation({
        summary: 'Sync words with Langeek',
        description:
            'Gets the list of words from vocabulary-service, then produces one Kafka message per word. Vocabulary-service consumes and processes each message (Langeek lookup + DB update).',
    })
    @ApiResponse({
        status: 200,
        description: 'Number of words enqueued (total, enqueued)',
    })
    async syncWordsWithLangeek(@Body() dto: SyncWordsLangeekDto) {
        const filters =
            dto.userId || dto.courseId || dto.lessonId || dto.wordId
                ? {
                      userId: dto.userId,
                      courseId: dto.courseId,
                      lessonId: dto.lessonId,
                      wordId: dto.wordId,
                  }
                : undefined;
        return this.dictionaryService.syncWordsWithLangeek(filters);
    }
}
