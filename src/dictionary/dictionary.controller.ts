import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import { DictionarySearchResultDto } from './dto/dctionary.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('dictionary')
@UseGuards(JwtAuthGuard)
export class DictionaryController {
    constructor(private readonly dictionaryService: DictionaryService) {}

    @Get('pronunciation/:word')
    @ApiOperation({
        summary: 'Get pronunciation for a word',
        description: 'Gets the pronunciation for a word',
    })
    @ApiParam({
        name: 'word',
        description: 'Word to get pronunciation for',
    })
    @ApiResponse({
        status: 200,
        description: 'Pronunciation retrieved successfully',
        type: String,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid word format',
    })
    getPronunciation(@Param('word') word: string): Promise<string> {
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
}
