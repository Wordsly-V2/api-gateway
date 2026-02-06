import {
    Course,
    CourseDetails,
    CoursesTotalStats,
    CreateCourseDto,
    CreateCourseLessonDto,
    CreateCourseLessonWordDto,
    Word,
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
        searchQuery: string = '',
    ): Promise<{ courses: Course[] }> {
        try {
            const response = await this.vocabularyServiceHttp.get<{
                courses: Course[];
            }>(`/users/${userLoginId}/courses`, {
                params: {
                    page,
                    limit,
                    orderByField,
                    orderByDirection,
                    searchQuery,
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
            }>(`/users/${userLoginId}/courses`, course);
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
                    `/users/${userLoginId}/courses/${courseId}`,
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
            }>(`/users/${userLoginId}/courses/${courseId}`, {
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
                    `/users/${userLoginId}/courses/total-stats`,
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
            }>(`/users/${userLoginId}/courses/${courseId}`, course);
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async createMyCourseLesson(
        userLoginId: string,
        courseId: string,
        lesson: CreateCourseLessonDto,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.post<{
                success: boolean;
            }>(`/users/${userLoginId}/courses/${courseId}/lessons`, lesson);
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async updateMyCourseLesson(
        userLoginId: string,
        courseId: string,
        lessonId: string,
        lesson: CreateCourseLessonDto,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.put<{
                success: boolean;
            }>(
                `/users/${userLoginId}/courses/${courseId}/lessons/${lessonId}`,
                lesson,
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async deleteMyCourseLesson(
        userLoginId: string,
        courseId: string,
        lessonId: string,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.delete<{
                success: boolean;
            }>(`/users/${userLoginId}/courses/${courseId}/lessons/${lessonId}`);
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async createMyCourseLessonWord(
        userLoginId: string,
        courseId: string,
        lessonId: string,
        word: CreateCourseLessonWordDto,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.post<{
                success: boolean;
            }>(
                `/users/${userLoginId}/courses/${courseId}/lessons/${lessonId}/words`,
                word,
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async createMyCourseLessonWordsBulk(
        userLoginId: string,
        courseId: string,
        lessonId: string,
        words: CreateCourseLessonWordDto[],
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.post<{
                success: boolean;
            }>(
                `/users/${userLoginId}/courses/${courseId}/lessons/${lessonId}/words/bulk`,
                words,
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async updateMyCourseLessonWord(
        userLoginId: string,
        courseId: string,
        lessonId: string,
        wordId: string,
        word: CreateCourseLessonWordDto,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.put<{
                success: boolean;
            }>(
                `/users/${userLoginId}/courses/${courseId}/lessons/${lessonId}/words/${wordId}`,
                word,
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async deleteMyCourseLessonWord(
        userLoginId: string,
        courseId: string,
        lessonId: string,
        wordId: string,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.delete<{
                success: boolean;
            }>(
                `/users/${userLoginId}/courses/${courseId}/lessons/${lessonId}/words/${wordId}`,
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async moveMyWordToOtherLesson(
        userLoginId: string,
        courseId: string,
        lessonId: string,
        wordId: string,
        targetLessonId: string,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.put<{
                success: boolean;
            }>(
                `/users/${userLoginId}/courses/${courseId}/lessons/${lessonId}/words/${wordId}/move`,
                { targetLessonId },
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async moveWordsBulkToOtherLesson(
        userLoginId: string,
        courseId: string,
        lessonId: string,
        wordIds: string[],
        targetLessonId: string,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.put<{
                success: boolean;
            }>(
                `/users/${userLoginId}/courses/${courseId}/lessons/${lessonId}/words/bulk-move`,
                { wordIds, targetLessonId },
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async deleteWordsBulkFromLesson(
        userLoginId: string,
        courseId: string,
        lessonId: string,
        wordIds: string[],
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.vocabularyServiceHttp.delete<{
                success: boolean;
            }>(
                `/users/${userLoginId}/courses/${courseId}/lessons/${lessonId}/words/bulk-delete`,
                { data: { wordIds } },
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getWordsByIds(
        userLoginId: string,
        courseId: string,
        wordIds: string,
    ): Promise<Word[]> {
        try {
            const response = await this.vocabularyServiceHttp.get<Word[]>(
                `/users/${userLoginId}/courses/${courseId}/words/by-ids`,
                {
                    params: { wordIds },
                },
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
