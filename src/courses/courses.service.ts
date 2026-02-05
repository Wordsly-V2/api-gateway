import {
    Course,
    CourseDetails,
    CoursesTotalStats,
    CreateCourseDto,
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

    async getCourses(
        userLoginId: string,
        page: number,
        limit: number,
        orderByField: 'createdAt' | 'name' = 'createdAt',
        orderByDirection: 'asc' | 'desc' = 'asc',
    ): Promise<{ courses: Course[] }> {
        try {
            const response = await this.vocabularyServiceHttp.get<{
                courses: Course[];
            }>(`/courses/user/${userLoginId}`, {
                params: {
                    page,
                    limit,
                    orderByField,
                    orderByDirection,
                },
            });
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async createMyCourses(
        userLoginId: string,
        course: CreateCourseDto,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.post<{
                success: boolean;
            }>(`/courses/user/${userLoginId}`, course);
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getCourseDetailsById(
        userLoginId: string,
        courseId: string,
    ): Promise<CourseDetails> {
        try {
            const response =
                await this.vocabularyServiceHttp.get<CourseDetails>(
                    `/courses/user/${userLoginId}/course/${courseId}`,
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
            }>(`/courses/user/${userLoginId}/course/${courseId}`, {
                data: {
                    userLoginId,
                },
            });
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getCoursesTotalStats(
        userLoginId: string,
    ): Promise<CoursesTotalStats> {
        try {
            const response =
                await this.vocabularyServiceHttp.get<CoursesTotalStats>(
                    `/courses/user/${userLoginId}/total-stats`,
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async updateMyCourseById(
        userLoginId: string,
        courseId: string,
        course: Partial<CreateCourseDto>,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.put<{
                success: boolean;
            }>(`/courses/user/${userLoginId}/course/${courseId}`, course);
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
