import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    NotificationPreferencesResponseDto,
    SubscribeDto,
    UnsubscribeDto,
    UpdatePreferencesDto,
    VapidPublicKeyResponseDto,
} from './dto/notifications.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Post('subscriptions')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Register a web push subscription' })
    @ApiBody({ type: SubscribeDto })
    @ApiResponse({ status: 200, description: 'Subscription registered' })
    subscribe(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: SubscribeDto,
    ): Promise<{ success: boolean }> {
        return this.notificationsService.subscribe(req.user.userLoginId, body);
    }

    @Delete('subscriptions')
    @ApiOperation({ summary: 'Remove a web push subscription' })
    @ApiBody({ type: UnsubscribeDto })
    @ApiResponse({ status: 200, description: 'Subscription removed' })
    unsubscribe(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: UnsubscribeDto,
    ): Promise<{ success: boolean }> {
        return this.notificationsService.unsubscribe(
            req.user.userLoginId,
            body.endpoint,
        );
    }

    @Get('preferences')
    @ApiOperation({ summary: 'Get notification preferences' })
    @ApiResponse({ status: 200, type: NotificationPreferencesResponseDto })
    getPreferences(
        @Req() req: Request & { user: JwtAuthPayload },
    ): Promise<NotificationPreferencesResponseDto> {
        return this.notificationsService.getPreferences(req.user.userLoginId);
    }

    @Patch('preferences')
    @ApiOperation({ summary: 'Update notification preferences' })
    @ApiBody({ type: UpdatePreferencesDto })
    @ApiResponse({ status: 200, type: NotificationPreferencesResponseDto })
    updatePreferences(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: UpdatePreferencesDto,
    ): Promise<NotificationPreferencesResponseDto> {
        return this.notificationsService.updatePreferences(
            req.user.userLoginId,
            body,
        );
    }

    @Get('vapid-public-key')
    @ApiOperation({ summary: 'Get the VAPID public key for push subscription' })
    @ApiResponse({ status: 200, type: VapidPublicKeyResponseDto })
    getVapidPublicKey(): Promise<VapidPublicKeyResponseDto> {
        return this.notificationsService.getVapidPublicKey();
    }
}
