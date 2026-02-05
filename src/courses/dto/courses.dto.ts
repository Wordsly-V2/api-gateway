import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
