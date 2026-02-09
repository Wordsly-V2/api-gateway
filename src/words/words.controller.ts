import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WordsService } from './words.service';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';

@Controller('words')
@UseGuards(JwtAuthGuard)
export class WordsController {
    constructor(private readonly wordsService: WordsService) {}

    @Get('pronunciation/:word')
    getPronunciation(@Param('word') word: string): Promise<string> {
        return this.wordsService.getPronunciation(word);
    }
}
