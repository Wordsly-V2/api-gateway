import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
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

export class CreateManyCoursesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCourseDto)
  courses: CreateCourseDto[];
}
