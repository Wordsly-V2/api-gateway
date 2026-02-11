import { ApiProperty } from '@nestjs/swagger';

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

    @ApiProperty({ example: 'We need to accumulate the money.' })
    examples: string[];
}
