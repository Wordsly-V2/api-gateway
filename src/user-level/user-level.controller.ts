import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserLevelResponseDto } from './dto/user-level.dto';
import { UserLevelService } from './user-level.service';

@ApiTags('user-level')
@Controller('user-level')
@UseGuards(JwtAuthGuard)
export class UserLevelController {
    constructor(private readonly userLevelService: UserLevelService) {}

    @Get()
    @ApiOperation({
        summary: 'Get the current user learning level',
        description:
            'Numeric level, rank tier, and XP progress toward the next level.',
    })
    @ApiResponse({
        status: 200,
        description: 'User level retrieved successfully',
        type: UserLevelResponseDto,
    })
    getUserLevel(
        @Req() req: Request & { user: JwtAuthPayload },
    ): Promise<UserLevelResponseDto> {
        return this.userLevelService.getUserLevel(req.user.userLoginId);
    }
}
