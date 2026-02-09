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
