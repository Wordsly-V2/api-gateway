import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import { DictionarySearchResultDto } from './dto/dctionary.dto';

@Injectable()
export class DictionaryService {
    constructor(
        @Inject('VOCABULARY_SERVICE_HTTP')
        private readonly vocabularyServiceHttp: AxiosInstance,
        private readonly errorHandlerService: ErrorHandlerService,
    ) {}

    async getPronunciation(word: string): Promise<string> {
        try {
            const response = await this.vocabularyServiceHttp.get<string>(
                `/dictionary/pronunciation/${word}`,
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async searchWords(word: string): Promise<DictionarySearchResultDto[]> {
        try {
            const response = await this.vocabularyServiceHttp.get<
                DictionarySearchResultDto[]
            >(`/dictionary/search/${word}`);
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getExamples(word: string): Promise<string[]> {
        try {
            const response = await this.vocabularyServiceHttp.get<string[]>(
                `/dictionary/examples/${word}`,
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
