import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import {
    BulkRecordAnswersDto,
    DueWordDto,
    RecordAnswerDto,
    WordProgressResponseDto,
    WordProgressStatsDto,
} from './dto/word-progress.dto';

@Injectable()
export class VocabularyService {
    constructor(
        @Inject('VOCABULARY_SERVICE_HTTP')
        private readonly vocabularyServiceHttp: AxiosInstance,
        private readonly errorHandlerService: ErrorHandlerService,
    ) {}

    async recordAnswer(
        userLoginId: string,
        body: RecordAnswerDto,
    ): Promise<WordProgressResponseDto> {
        try {
            const response =
                await this.vocabularyServiceHttp.post<WordProgressResponseDto>(
                    `/users/${userLoginId}/word-progress/record-answer`,
                    body,
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async recordAnswers(
        userLoginId: string,
        body: BulkRecordAnswersDto,
    ): Promise<WordProgressResponseDto[]> {
        try {
            const response = await this.vocabularyServiceHttp.post<
                WordProgressResponseDto[]
            >(`/users/${userLoginId}/word-progress/record-answers`, body);
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getDueWords(
        userLoginId: string,
        courseId?: string,
        lessonId?: string,
        limit?: number,
        includeNew?: string,
    ): Promise<DueWordDto[]> {
        try {
            const response = await this.vocabularyServiceHttp.get<DueWordDto[]>(
                `/users/${userLoginId}/word-progress/due-words`,
                {
                    params: {
                        courseId,
                        lessonId,
                        limit,
                        includeNew,
                    },
                },
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getProgressStats(
        userLoginId: string,
        courseId?: string,
        lessonId?: string,
    ): Promise<WordProgressStatsDto> {
        try {
            const response =
                await this.vocabularyServiceHttp.get<WordProgressStatsDto>(
                    `/users/${userLoginId}/word-progress/stats`,
                    {
                        params: {
                            courseId,
                            lessonId,
                        },
                    },
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getWordProgress(
        userLoginId: string,
        wordId: string,
    ): Promise<WordProgressResponseDto | null> {
        try {
            const response =
                await this.vocabularyServiceHttp.get<WordProgressResponseDto | null>(
                    `/users/${userLoginId}/word-progress/words/${wordId}`,
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async resetProgress(
        userLoginId: string,
        wordId: string,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.delete<{
                success: boolean;
            }>(`/users/${userLoginId}/word-progress/words/${wordId}/reset`);
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
