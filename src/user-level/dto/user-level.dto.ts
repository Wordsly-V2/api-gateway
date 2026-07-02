import { ApiProperty } from '@nestjs/swagger';

/** A user's learning level snapshot derived from cumulative XP. */
export class UserLevelResponseDto {
    @ApiProperty({ description: 'Current numeric level', example: 7 })
    level: number;

    @ApiProperty({
        description: 'Named rank tier for the level',
        example: 'Apprentice',
    })
    rank: string;

    @ApiProperty({ description: 'Cumulative XP earned all-time', example: 430 })
    totalXp: number;

    @ApiProperty({
        description: 'XP earned within the current level',
        example: 130,
    })
    currentLevelXp: number;

    @ApiProperty({
        description: 'Total XP span of the current level',
        example: 200,
    })
    xpForThisLevel: number;

    @ApiProperty({
        description: 'XP still needed to reach the next level',
        example: 70,
    })
    xpToNextLevel: number;

    @ApiProperty({
        description: 'Progress through the current level, 0..100',
        example: 65,
    })
    progress: number;
}
