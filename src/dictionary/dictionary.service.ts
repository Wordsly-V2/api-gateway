import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { KAFKA_TOPICS } from '@/kafka/kafka-topics';
import { KafkaService } from '@/kafka/kafka.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import {
    DictionarySearchResultDto,
    LangeekWordDetailsDto,
} from './dto/dctionary.dto';

@Injectable()
export class DictionaryService {
    constructor(
        @Inject('VOCABULARY_SERVICE_HTTP')
        private readonly vocabularyServiceHttp: AxiosInstance,
        private readonly errorHandlerService: ErrorHandlerService,
        private readonly kafkaService: KafkaService,
    ) {}

    async getPronunciation(word: string): Promise<{
        pronunciation: { type: string; url: string }[];
        ipas: { partOfSpeech: string; uk: string | null; us: string | null }[];
    }> {
        try {
            const response = await this.vocabularyServiceHttp.get<{
                pronunciation: { type: string; url: string }[];
                ipas: {
                    partOfSpeech: string;
                    uk: string | null;
                    us: string | null;
                }[];
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

    async getLangeekWordDetails(
        langeekWordId: number,
        partOfSpeech: string,
    ): Promise<LangeekWordDetailsDto | null> {
        try {
            const response =
                await this.vocabularyServiceHttp.get<LangeekWordDetailsDto | null>(
                    `/dictionary/word-details/${langeekWordId}/${partOfSpeech}`,
                );
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

    async syncWordsWithLangeek(filters?: {
        userId?: string;
        courseId?: string;
        lessonId?: string;
        wordId?: string;
    }): Promise<{ total: number; enqueued: number }> {
        try {
            let totalEnqueued = 0;
            let cursor: string | undefined;

            do {
                const { data } = await this.vocabularyServiceHttp.post<{
                    words: {
                        wordId: string;
                        word: string;
                        partOfSpeech: string | null;
                    }[];
                    nextCursor: string | null;
                }>('/dictionary/sync-words-langeek/words', {
                    ...(filters ?? {}),
                    cursor,
                    limit: 500,
                });
                const words = data?.words ?? [];
                const nextCursor = data?.nextCursor ?? null;

                if (words.length > 0) {
                    await this.kafkaService.sendBatch(
                        KAFKA_TOPICS.DICTIONARY_SYNC_WORD_LANGEEK,
                        words.map((w) => ({
                            wordId: w.wordId,
                            word: w.word,
                            partOfSpeech: w.partOfSpeech,
                        })),
                    );
                    totalEnqueued += words.length;
                }
                cursor = nextCursor ?? undefined;
            } while (cursor);

            return { total: totalEnqueued, enqueued: totalEnqueued };
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
