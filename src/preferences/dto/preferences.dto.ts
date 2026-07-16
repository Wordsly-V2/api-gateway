import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

/** Opaque per-user preferences blob (shape owned by the frontend). */
export type PreferencesBlob = Record<string, unknown>;

export class PreferencesResponseDto {
    @ApiProperty({
        description: 'Synced app/UI preferences blob',
        example: { practice: { mode: 'mixed' }, dueWordsLimit: 20 },
        type: 'object',
        additionalProperties: true,
    })
    preferences: PreferencesBlob;
}

export class UpdatePreferencesDto {
    @ApiProperty({
        description:
            'Partial preferences to merge (last-write-wins per top-level key)',
        example: { dueWordsLimit: 10 },
        type: 'object',
        additionalProperties: true,
    })
    @IsObject()
    preferences: PreferencesBlob;
}
