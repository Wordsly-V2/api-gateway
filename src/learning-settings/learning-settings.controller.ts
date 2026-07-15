import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    LearningSettingsResponseDto,
    UpdateLearningSettingsDto,
} from './dto/learning-settings.dto';
import { LearningSettingsService } from './learning-settings.service';

@ApiTags('learning-settings')
@Controller('learning-settings')
@UseGuards(JwtAuthGuard)
export class LearningSettingsController {
    constructor(
        private readonly learningSettingsService: LearningSettingsService,
    ) {}

    @Get()
    @ApiOperation({
        summary: 'Get the current learning settings',
        description:
            'Daily pacing limits and leech handling configuration for the user.',
    })
    @ApiResponse({
        status: 200,
        description: 'Learning settings retrieved successfully',
        type: LearningSettingsResponseDto,
    })
    getSettings(
        @Req() req: Request & { user: JwtAuthPayload },
    ): Promise<LearningSettingsResponseDto> {
        return this.learningSettingsService.getSettings(req.user.userLoginId);
    }

    @Patch()
    @ApiOperation({
        summary: 'Update learning settings',
    })
    @ApiBody({ type: UpdateLearningSettingsDto })
    @ApiResponse({
        status: 200,
        description: 'Learning settings updated successfully',
        type: LearningSettingsResponseDto,
    })
    updateSettings(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: UpdateLearningSettingsDto,
    ): Promise<LearningSettingsResponseDto> {
        return this.learningSettingsService.updateSettings(
            req.user.userLoginId,
            body,
        );
    }
}
