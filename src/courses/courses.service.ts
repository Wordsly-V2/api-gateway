import {
    CreateManyCoursesDto,
    Course,
    CourseDetails,
} from '@/courses/dto/courses.dto';
import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';

@Injectable()
export class CoursesService {
    constructor(
        @Inject('VOCABULARY_SERVICE_HTTP')
        private readonly vocabularyServiceHttp: AxiosInstance,
        private readonly errorHandlerService: ErrorHandlerService,
    ) {}

    async getCourses(userLoginId: string): Promise<{ courses: Course[] }> {
        try {
            const response = await this.vocabularyServiceHttp.get<{
                courses: Course[];
            }>(`/courses/user/${userLoginId}`);
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async createMyCourses(
        userLoginId: string,
        courses: CreateManyCoursesDto,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.post<{
                success: boolean;
            }>(`/courses/user/${userLoginId}`, courses);
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getCourseDetailsById(courseId: string): Promise<CourseDetails> {
        try {
            const response =
                await this.vocabularyServiceHttp.get<CourseDetails>(
                    `/courses/course/${courseId}`,
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async deleteMyCourse(
        userLoginId: string,
        courseId: string,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.delete<{
                success: boolean;
            }>(`/courses/course/${courseId}`, {
                data: {
                    userLoginId,
                },
            });
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
