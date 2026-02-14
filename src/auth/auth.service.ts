import { JwtAuthPayload, LoginResponse, OAuthUser } from '@/auth/dto/auth.dto';
import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';

@Injectable()
export class AuthService {
    constructor(
        @Inject('AUTH_SERVICE_HTTP')
        private readonly authServiceHttp: AxiosInstance,
        private readonly errorHandlerService: ErrorHandlerService,
        private readonly configService: ConfigService,
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

    getRefreshTokenCookieOptions(): {
        maxAge: ms.StringValue;
        isSecure: boolean;
        sameSite: 'lax' | 'strict' | 'none';
        httpOnly: boolean;
        path: string;
    } {
        const maxAge = this.configService.get<string>(
            'refreshTokenCookieOptions.maxAge',
        ) as ms.StringValue;
        const isSecure = this.configService.get<boolean>(
            'refreshTokenCookieOptions.secure',
        ) as boolean;
        const sameSite = this.configService.get<string>(
            'refreshTokenCookieOptions.sameSite',
        ) as 'lax' | 'strict' | 'none';
        const httpOnly = this.configService.get<boolean>(
            'refreshTokenCookieOptions.httpOnly',
        ) as boolean;
        const path = this.configService.get<string>(
            'refreshTokenCookieOptions.path',
        ) as string;

        return {
            maxAge,
            isSecure,
            sameSite,
            httpOnly,
            path,
        };
    }
}
