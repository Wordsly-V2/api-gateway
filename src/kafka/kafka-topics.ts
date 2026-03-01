/**
 * Kafka topic names. Use these constants for producing and consuming
 * so topic names stay in sync across the codebase.
 */
export const KAFKA_TOPICS = {
    WORD_PROGRESS_RECORD_ANSWER: 'word-progress_record-answer',
    /** One message per word; vocabulary-service consumes and syncs with Langeek. */
    DICTIONARY_SYNC_WORD_LANGEEK: 'dictionary_sync-word-langeek',
} as const;
