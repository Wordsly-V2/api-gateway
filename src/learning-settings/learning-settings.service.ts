import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import {
    LearningSettingsResponseDto,
    UpdateLearningSettingsDto,
} from './dto/learning-settings.dto';

@Injectable()
export class LearningSettingsService {
    constructor(
        @Inject('LEARNING_SERVICE_HTTP')
        private readonly learningServiceHttp: AxiosInstance,
        private readonly errorHandlerService: ErrorHandlerService,
    ) {}

    async getSettings(
        userLoginId: string,
    ): Promise<LearningSettingsResponseDto> {
        try {
            const response =
                await this.learningServiceHttp.get<LearningSettingsResponseDto>(
                    `/users/${userLoginId}/learning-settings`,
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async updateSettings(
        userLoginId: string,
        body: UpdateLearningSettingsDto,
    ): Promise<LearningSettingsResponseDto> {
        try {
            const response =
                await this.learningServiceHttp.patch<LearningSettingsResponseDto>(
                    `/users/${userLoginId}/learning-settings`,
                    body,
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
