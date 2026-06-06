import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { KAFKA_TOPICS } from '@/kafka/kafka-topics';
import type {
    WordProgressRecordAnswerPayload,
    WordProgressRecordAnswersBulkPayload,
} from '@/kafka/messages';
import { KafkaService } from '@/kafka/kafka.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import {
    BulkRecordAnswersDto,
    DueWordIdsResponseDto,
    GetDueWordsQueryDto,
    RecordAnswerAcceptedDto,
    RecordAnswerDto,
    WordProgressResponseDto,
    WordProgressStatsDto,
} from './dto/word-progress.dto';

type WordScopeGroup = {
    wordIds: string[];
    totalWords: number;
};

@Injectable()
export class WordProgressService {
    constructor(
        @Inject('LEARNING_SERVICE_HTTP')
        private readonly learningServiceHttp: AxiosInstance,
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

    async recordAnswerBulk(
        userLoginId: string,
        body: BulkRecordAnswersDto,
    ): Promise<RecordAnswerAcceptedDto> {
        const payload: WordProgressRecordAnswersBulkPayload = {
            userLoginId,
            answers: body.answers,
        };
        await this.kafkaService.sendMessage(
            KAFKA_TOPICS.WORD_PROGRESS_RECORD_ANSWERS_BULK,
            payload,
        );
        return { accepted: true };
    }

    async recordAnswerBulkSync(
        userLoginId: string,
        body: BulkRecordAnswersDto,
    ): Promise<WordProgressResponseDto[]> {
        try {
            const response = await this.learningServiceHttp.post<
                WordProgressResponseDto[]
            >(
                `/users/${userLoginId}/word-progress/record-answer/bulk-sync`,
                body,
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    private async getScopedWordIds(
        userLoginId: string,
        courseId?: string,
        lessonId?: string,
    ): Promise<string[]> {
        try {
            const response = await this.vocabularyServiceHttp.get<{
                wordIds: string[];
            }>(`/users/${userLoginId}/words/scoped-ids`, {
                params: { courseId, lessonId },
            });
            return response.data.wordIds;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    private async getGroupedWordIdsByCourseIds(
        userLoginId: string,
        courseIds: string[],
    ): Promise<Record<string, WordScopeGroup>> {
        try {
            const response = await this.vocabularyServiceHttp.post<
                Record<string, WordScopeGroup>
            >(`/users/${userLoginId}/words/group-by-course-ids`, { courseIds });
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    private async getGroupedWordIdsByLessonIds(
        userLoginId: string,
        lessonIds: string[],
    ): Promise<Record<string, WordScopeGroup>> {
        try {
            const response = await this.vocabularyServiceHttp.post<
                Record<string, WordScopeGroup>
            >(`/users/${userLoginId}/words/group-by-lesson-ids`, { lessonIds });
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getDueWordIds(
        userLoginId: string,
        query: GetDueWordsQueryDto,
    ): Promise<DueWordIdsResponseDto> {
        try {
            const wordIds = await this.getScopedWordIds(
                userLoginId,
                query.courseId,
                query.lessonId,
            );
            const response =
                await this.learningServiceHttp.post<DueWordIdsResponseDto>(
                    `/users/${userLoginId}/word-progress/due-word-ids`,
                    {
                        wordIds,
                        limit: query.limit,
                        includeNew: query.includeNew,
                    },
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getDueWordIdsByWordIds(
        userLoginId: string,
        wordIds: string[],
        limit?: number,
        includeNew?: boolean,
    ): Promise<DueWordIdsResponseDto> {
        try {
            const response =
                await this.learningServiceHttp.post<DueWordIdsResponseDto>(
                    `/users/${userLoginId}/word-progress/due-word-ids`,
                    { wordIds, limit, includeNew },
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
            const wordIds = await this.getScopedWordIds(
                userLoginId,
                courseId,
                lessonId,
            );
            const response =
                await this.learningServiceHttp.post<WordProgressStatsDto>(
                    `/users/${userLoginId}/word-progress/stats`,
                    { wordIds },
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getProgressStatsByWordIds(
        userLoginId: string,
        wordIds: string[],
    ): Promise<WordProgressStatsDto> {
        try {
            const response =
                await this.learningServiceHttp.post<WordProgressStatsDto>(
                    `/users/${userLoginId}/word-progress/stats`,
                    { wordIds },
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
                await this.learningServiceHttp.get<WordProgressResponseDto | null>(
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
            const response = await this.learningServiceHttp.delete<{
                success: boolean;
            }>(`/users/${userLoginId}/word-progress/words/${wordId}/reset`);
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async resetProgressBulk(
        userLoginId: string,
        wordIds: string[],
    ): Promise<{ count: number }> {
        try {
            const response = await this.learningServiceHttp.delete<{
                count: number;
            }>(`/users/${userLoginId}/word-progress/words/bulk-reset`, {
                data: { wordIds },
            });
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getProgressStatsByCourseIds(
        userLoginId: string,
        courseIds: string[],
    ): Promise<Record<string, WordProgressStatsDto>> {
        try {
            const grouped = await this.getGroupedWordIdsByCourseIds(
                userLoginId,
                courseIds,
            );
            const scopes = courseIds.map((courseId) => ({
                scopeId: courseId,
                wordIds: grouped[courseId]?.wordIds ?? [],
            }));
            const response = await this.learningServiceHttp.post<
                Record<string, WordProgressStatsDto>
            >(`/users/${userLoginId}/word-progress/stats/by-scopes`, {
                scopes,
            });
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getProgressStatsByLessonIds(
        userLoginId: string,
        lessonIds: string[],
    ): Promise<Record<string, WordProgressStatsDto>> {
        try {
            const grouped = await this.getGroupedWordIdsByLessonIds(
                userLoginId,
                lessonIds,
            );
            const scopes = lessonIds.map((lessonId) => ({
                scopeId: lessonId,
                wordIds: grouped[lessonId]?.wordIds ?? [],
            }));
            const response = await this.learningServiceHttp.post<
                Record<string, WordProgressStatsDto>
            >(`/users/${userLoginId}/word-progress/stats/by-scopes`, {
                scopes,
            });
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getProgressStatsByScopes(
        userLoginId: string,
        scopes: { scopeId: string; wordIds: string[] }[],
    ): Promise<Record<string, WordProgressStatsDto>> {
        try {
            const response = await this.learningServiceHttp.post<
                Record<string, WordProgressStatsDto>
            >(`/users/${userLoginId}/word-progress/stats/by-scopes`, {
                scopes,
            });
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getProgressByWordIds(
        userLoginId: string,
        wordIds: string[],
    ): Promise<Record<string, WordProgressResponseDto | null>> {
        try {
            const response = await this.learningServiceHttp.post<
                Record<string, WordProgressResponseDto | null>
            >(`/users/${userLoginId}/word-progress/by-word-ids`, { wordIds });
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
