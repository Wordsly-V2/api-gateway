import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    IsUUID,
} from 'class-validator';

export type Course = {
    id: string;
    name: string;
    coverImageUrl?: string;
    userLoginId?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type Lesson = {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
};

export type Word = {
    id: string;
    word: string;
    meaning: string;
    pronunciation?: string;
    partOfSpeech?: string;
    audioUrl?: string;
    lessonId: string;
};

export type CourseDetails = Course & {
    lessons: Lesson[];
};

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    coverImageUrl?: string;
}

export type CoursesTotalStats = {
    totalCourses: number;
    totalLessons: number;
    totalWords: number;
};

export class CreateCourseLessonDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    coverImageUrl?: string;

    @IsNumber()
    @IsOptional()
    maxWords?: number;

    @IsNumber()
    @IsOptional()
    orderIndex?: number;
}

export class CreateCourseLessonWordDto {
    @IsString()
    @IsNotEmpty()
    word: string;

    @IsString()
    @IsNotEmpty()
    meaning: string;

    @IsString()
    @IsOptional()
    pronunciation?: string;

    @IsString()
    @IsOptional()
    partOfSpeech?: string;

    @IsString()
    @IsOptional()
    audioUrl?: string;
}

export class ReorderLessonsDto {
    @ApiProperty({
        description: 'ID of the lesson that was dragged',
        example: '01936c1e-1234-7890-abcd-ef1234567890',
    })
    @IsUUID()
    @IsNotEmpty()
    lessonId: string;

    @ApiProperty({
        description:
            'Target position (1-based). The dragged lesson will be placed at this order index.',
        example: 3,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    targetOrderIndex: number;
}
