import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { KAFKA_TOPICS } from '@/kafka/kafka-topics';
import type { WordProgressRecordAnswerPayload } from '@/kafka/messages';
import { KafkaService } from '@/kafka/kafka.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import {
    DueWordIdsResponseDto,
    GetDueWordsQueryDto,
    RecordAnswerAcceptedDto,
    RecordAnswerDto,
    WordProgressResponseDto,
    WordProgressStatsDto,
} from './dto/word-progress.dto';

@Injectable()
export class WordProgressService {
    constructor(
        @Inject('VOCABULARY_SERVICE_HTTP')
        private readonly vocabularyServiceHttp: AxiosInstance,
        private readonly errorHandlerService: ErrorHandlerService,
        private readonly kafkaService: KafkaService,
    ) {}

    async recordAnswer(
        userLoginId: string,
        body: RecordAnswerDto,
    ): Promise<RecordAnswerAcceptedDto> {
        const payload: WordProgressRecordAnswerPayload = {
            userLoginId,
            ...body,
        };
        await this.kafkaService.sendMessage(
            KAFKA_TOPICS.WORD_PROGRESS_RECORD_ANSWER,
            payload,
        );
        return { accepted: true };
    }

    async getDueWordIds(
        userLoginId: string,
        query: GetDueWordsQueryDto,
    ): Promise<DueWordIdsResponseDto> {
        try {
            const response =
                await this.vocabularyServiceHttp.get<DueWordIdsResponseDto>(
                    `/users/${userLoginId}/word-progress/due-word-ids`,
                    {
                        params: {
                            ...query,
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
