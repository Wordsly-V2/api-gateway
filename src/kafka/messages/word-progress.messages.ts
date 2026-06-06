import type { AnswerQuality } from '@/word-progress/dto/word-progress.dto';

/**
 * Payload for topic: word-progress_record-answer
 * Emitted when a user records an answer for a word (async processing).
 */
export interface WordProgressRecordAnswerPayload {
    userLoginId: string;
    wordId: string;
    quality: AnswerQuality;
}

/**
 * Payload for topic: word-progress_record-answers-bulk
 * One message per practice session batch (async processing).
 */
export interface WordProgressRecordAnswersBulkPayload {
    userLoginId: string;
    answers: {
        wordId: string;
        quality: AnswerQuality;
    }[];
}
