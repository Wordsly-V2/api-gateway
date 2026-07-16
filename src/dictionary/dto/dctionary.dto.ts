import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

/** Optional filters for syncing words with Langeek. All omitted = sync all words. */
export class SyncWordsLangeekDto {
    @ApiPropertyOptional({
        description: 'Filter by user (course owner)',
        example: '01936c1e-1234-7890-abcd-ef1234567890',
    })
    @IsOptional()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional({
        description: 'Filter by course',
        example: '01936c1e-5678-7890-abcd-ef1234567890',
    })
    @IsOptional()
    @IsUUID()
    courseId?: string;

    @ApiPropertyOptional({
        description: 'Filter by lesson',
        example: '01936c1e-9abc-7890-abcd-ef1234567890',
    })
    @IsOptional()
    @IsUUID()
    lessonId?: string;

    @ApiPropertyOptional({
        description: 'Filter by single word',
        example: '01936c1e-def0-7890-abcd-ef1234567890',
    })
    @IsOptional()
    @IsUUID()
    wordId?: string;
}

/** A single example sentence with optional per-example audio/translation. */
export class LangeekExampleDto {
    @ApiProperty({ example: 'She waved hello to her neighbour.' })
    text: string;

    @ApiPropertyOptional({
        description: 'Audio (TTS) URL for the example sentence',
        example: 'https://example.com/audio/example.mp3',
    })
    audioUrl?: string;

    @ApiPropertyOptional({ description: 'Translation of the example sentence' })
    translation?: string;
}

/** Structured word details from vocabulary-service GET word-details. */
export class LangeekWordDetailsDto {
    @ApiProperty()
    word: string;

    @ApiProperty()
    meaning: string;

    @ApiProperty()
    partOfSpeech: string;

    @ApiProperty()
    pronunciation: string;

    @ApiProperty()
    audioUrl: string;

    @ApiProperty({ type: [LangeekExampleDto] })
    examples: LangeekExampleDto[];

    @ApiProperty({
        description: 'URL to word image, or empty if none',
        example: 'https://cdn.langeek.co/photo/48239/original/?type=jpeg',
    })
    imageUrl: string;
}

export class DictionarySearchResultDto {
    @ApiProperty({ example: 'accumulate' })
    word: string;

    @ApiProperty({ example: 'verb' })
    partOfSpeech: string;

    @ApiProperty({ example: 'tích lũy,thu thập' })
    meaning: string;

    @ApiProperty({
        description: 'URL to word image, or empty if none',
        example: 'https://cdn.langeek.co/photo/48239/original/?type=jpeg',
    })
    imageUrl: string;
}
