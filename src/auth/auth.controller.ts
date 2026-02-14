import { AuthService } from '@/auth/auth.service';
import { JwtAuthPayload, LoginResponse, OAuthUser } from '@/auth/dto/auth.dto';
import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import ms from 'ms';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    @Get('google')
    @UseGuards(AuthGuard('google'))
    google() {}

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleRedirect(
        @Req() req: Request & { user: OAuthUser },
        @Res() res: Response,
    ) {
        const userIpAddress = req.ip;
        const frontendRedirectUrl = this.configService.get(
            'googleOAuth.frontendRedirectUrl',
        ) as string;

        try {
            const { accessToken, refreshToken }: LoginResponse =
                await this.authService.handleOAuthLogin(
                    req.user,
                    userIpAddress,
                );
            this.setRefreshTokenCookie(res, refreshToken);

            return res.redirect(
                `${frontendRedirectUrl}?access_token=${accessToken}`,
            );
        } catch (error) {
            return res.redirect(
                `${frontendRedirectUrl}?error=${JSON.stringify(error)}`,
            );
        }
    }

    @Get('refresh-token')
    async refresh(
        @Req() req: Request & { cookies: { refresh_token: string } },
        @Res() res: Response,
    ) {
        const userIpAddress = req.ip;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const refreshToken = req.cookies['refresh_token'] as string;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not found' });
        }

        try {
            const jwtPayload =
                this.jwtService.verify<JwtAuthPayload>(refreshToken);

            const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            }: LoginResponse = await this.authService.handleRefreshToken({
                jwtPayload,
                userIpAddress,
            });

            this.setRefreshTokenCookie(res, newRefreshToken);

            return res.status(200).json({ accessToken: newAccessToken });
        } catch (error) {
            return res.status(401).json({
                message: 'HandleRefreshToken failed, error: ' + error,
            });
        }
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(
        @Req()
        req: Request & {
            user: JwtAuthPayload;
        },
        @Body() body: { isLoggedOutFromAllDevices?: boolean } = {},
        @Res() res: Response,
    ) {
        const isLoggedOutFromAllDevices =
            body.isLoggedOutFromAllDevices ?? false;
        await this.authService.handleLogout(
            req.user,
            isLoggedOutFromAllDevices,
        );
        res.clearCookie('refresh_token');
        return res.status(200).json({ message: 'Logged out successfully' });
    }

    private setRefreshTokenCookie(res: Response, refreshToken: string) {
        const { maxAge, isSecure, sameSite, httpOnly, path } =
            this.authService.getRefreshTokenCookieOptions();

        res.cookie('refresh_token', refreshToken, {
            httpOnly: httpOnly,
            secure: isSecure,
            sameSite: sameSite,
            path: path,
            maxAge: ms(maxAge),
        });
    }
}
