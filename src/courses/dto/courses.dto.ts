import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export interface ICourse {
  id: string;
  name: string;
  coverImageUrl?: string;
  userLoginId?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
