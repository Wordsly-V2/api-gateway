import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import {
    DailyHabitResponseDto,
    RecordDailyPracticeDto,
    UpdateDailyGoalDto,
} from './dto/daily-habit.dto';

@Injectable()
export class DailyHabitService {
    constructor(
        @Inject('LEARNING_SERVICE_HTTP')
        private readonly learningServiceHttp: AxiosInstance,
        private readonly errorHandlerService: ErrorHandlerService,
    ) {}

    async getDailyHabit(
        userLoginId: string,
        clientDate?: string,
    ): Promise<DailyHabitResponseDto> {
        try {
            const response =
                await this.learningServiceHttp.get<DailyHabitResponseDto>(
                    `/users/${userLoginId}/daily-habit`,
                    { params: { clientDate } },
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async recordPractice(
        userLoginId: string,
        body: RecordDailyPracticeDto,
    ): Promise<DailyHabitResponseDto> {
        try {
            const response =
                await this.learningServiceHttp.post<DailyHabitResponseDto>(
                    `/users/${userLoginId}/daily-habit/record-practice`,
                    body,
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async updateDailyGoal(
        userLoginId: string,
        body: UpdateDailyGoalDto,
        clientDate?: string,
    ): Promise<DailyHabitResponseDto> {
        try {
            const response =
                await this.learningServiceHttp.patch<DailyHabitResponseDto>(
                    `/users/${userLoginId}/daily-habit/goal`,
                    body,
                    { params: { clientDate } },
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
