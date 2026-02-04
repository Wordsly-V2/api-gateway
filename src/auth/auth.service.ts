import { JwtAuthPayload, LoginResponse, OAuthUser } from '@/auth/dto/auth.dto';
import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';

@Injectable()
export class AuthService {
    constructor(
        @Inject('AUTH_SERVICE_HTTP')
        private readonly authServiceHttp: AxiosInstance,
        private readonly errorHandlerService: ErrorHandlerService,
    ) {}

    async handleOAuthLogin(
        user: OAuthUser,
        userIpAddress: string | undefined,
    ): Promise<LoginResponse> {
        try {
            const response = await this.authServiceHttp.post<LoginResponse>(
                '/auth/login-oauth',
                { user, userIpAddress },
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async handleRefreshToken({
        jwtPayload,
        userIpAddress,
    }: {
        jwtPayload: JwtAuthPayload;
        userIpAddress: string | undefined;
    }): Promise<LoginResponse> {
        try {
            const response = await this.authServiceHttp.post<LoginResponse>(
                '/auth/refresh-token',
                { jwtPayload, userIpAddress },
            );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }

    async handleLogout(
        user: JwtAuthPayload,
        isLoggedOutFromAllDevices: boolean = false,
    ): Promise<{ success: boolean }> {
        try {
            const response = await this.authServiceHttp.post<{
                success: boolean;
            }>('/auth/logout', {
                user,
                isLoggedOutFromAllDevices,
            });
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
