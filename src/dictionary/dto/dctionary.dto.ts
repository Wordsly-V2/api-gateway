import { ApiProperty } from '@nestjs/swagger';

export class DictionarySearchResultDto {
    @ApiProperty({ example: 'accumulate' })
    word: string;

    @ApiProperty({ example: 'verb' })
    partOfSpeech: string;

    @ApiProperty({
        type: [String],
        example: ['tích lũy,thu thập', 'tích lũy,tích tụ'],
    })
    meanings: string[];

    @ApiProperty({
        description: 'URL to word image, or empty if none',
        example: 'https://cdn.langeek.co/photo/48239/original/?type=jpeg',
    })
    imageUrl: string;
}
