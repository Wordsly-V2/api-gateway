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

    async getPronunciation(word: string): Promise<{
        pronunciation: { type: string; url: string }[];
        ipas: { partOfSpeech: string; uk: string | null; us: string | null }[];
    }> {
        try {
            const response = await this.vocabularyServiceHttp.get<{
                pronunciation: { type: string; url: string }[];
                ipas: { partOfSpeech: string; uk: string | null; us: string | null }[];
            }>(`/dictionary/pronunciation/${encodeURIComponent(word)}`);
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

    async searchUserWords(
        userLoginId: string,
        word: string,
    ): Promise<string[]> {
        try {
            const response = await this.vocabularyServiceHttp.get<string[]>(
                `dictionary/users/${userLoginId}/words/search/${word}`,
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
