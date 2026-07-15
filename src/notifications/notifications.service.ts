import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import {
    NotificationPreferencesResponseDto,
    SubscribeDto,
    UpdatePreferencesDto,
    VapidPublicKeyResponseDto,
} from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @Inject('LEARNING_SERVICE_HTTP')
        private readonly learningServiceHttp: AxiosInstance,
        private readonly errorHandlerService: ErrorHandlerService,
    ) {}

    async subscribe(
        userLoginId: string,
        body: SubscribeDto,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.learningServiceHttp.post<{
                success: boolean;
            }>(`/users/${userLoginId}/notifications/subscriptions`, body);
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async unsubscribe(
        userLoginId: string,
        endpoint: string,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.learningServiceHttp.delete<{
                success: boolean;
            }>(`/users/${userLoginId}/notifications/subscriptions`, {
                data: { endpoint },
            });
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getPreferences(
        userLoginId: string,
    ): Promise<NotificationPreferencesResponseDto> {
        try {
            const response =
                await this.learningServiceHttp.get<NotificationPreferencesResponseDto>(
                    `/users/${userLoginId}/notifications/preferences`,
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async updatePreferences(
        userLoginId: string,
        body: UpdatePreferencesDto,
    ): Promise<NotificationPreferencesResponseDto> {
        try {
            const response =
                await this.learningServiceHttp.patch<NotificationPreferencesResponseDto>(
                    `/users/${userLoginId}/notifications/preferences`,
                    body,
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async getVapidPublicKey(): Promise<VapidPublicKeyResponseDto> {
        try {
            const response =
                await this.learningServiceHttp.get<VapidPublicKeyResponseDto>(
                    `/notifications/vapid-public-key`,
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
