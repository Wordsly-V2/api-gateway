import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import {
    PreferencesResponseDto,
    UpdatePreferencesDto,
} from './dto/preferences.dto';

@Injectable()
export class PreferencesService {
    constructor(
        @Inject('LEARNING_SERVICE_HTTP')
        private readonly learningServiceHttp: AxiosInstance,
        private readonly errorHandlerService: ErrorHandlerService,
    ) {}

    async getPreferences(userLoginId: string): Promise<PreferencesResponseDto> {
        try {
            const response =
                await this.learningServiceHttp.get<PreferencesResponseDto>(
                    `/users/${userLoginId}/preferences`,
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async updatePreferences(
        userLoginId: string,
        body: UpdatePreferencesDto,
    ): Promise<PreferencesResponseDto> {
        try {
            const response =
                await this.learningServiceHttp.patch<PreferencesResponseDto>(
                    `/users/${userLoginId}/preferences`,
                    body,
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
