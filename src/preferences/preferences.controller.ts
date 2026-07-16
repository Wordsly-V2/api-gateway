import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    PreferencesResponseDto,
    UpdatePreferencesDto,
} from './dto/preferences.dto';
import { PreferencesService } from './preferences.service';

@ApiTags('preferences')
@Controller('preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
    constructor(private readonly preferencesService: PreferencesService) {}

    @Get()
    @ApiOperation({
        summary: 'Get synced app/UI preferences',
        description:
            'Device-independent preferences (practice settings, batch size, theme, …).',
    })
    @ApiResponse({ status: 200, type: PreferencesResponseDto })
    getPreferences(
        @Req() req: Request & { user: JwtAuthPayload },
    ): Promise<PreferencesResponseDto> {
        return this.preferencesService.getPreferences(req.user.userLoginId);
    }

    @Patch()
    @ApiOperation({
        summary: 'Update synced preferences (last-write-wins per key)',
    })
    @ApiBody({ type: UpdatePreferencesDto })
    @ApiResponse({ status: 200, type: PreferencesResponseDto })
    updatePreferences(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: UpdatePreferencesDto,
    ): Promise<PreferencesResponseDto> {
        return this.preferencesService.updatePreferences(
            req.user.userLoginId,
            body,
        );
    }
}
