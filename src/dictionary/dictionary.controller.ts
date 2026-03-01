import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import { DictionarySearchResultDto } from './dto/dctionary.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthPayload } from '@/auth/dto/auth.dto';

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
}
