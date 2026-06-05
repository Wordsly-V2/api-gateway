import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    DailyHabitQueryDto,
    DailyHabitResponseDto,
    RecordDailyPracticeDto,
} from './dto/daily-habit.dto';
import { DailyHabitService } from './daily-habit.service';

@ApiTags('daily-habit')
@Controller('daily-habit')
@UseGuards(JwtAuthGuard)
export class DailyHabitController {
    constructor(private readonly dailyHabitService: DailyHabitService) {}

    @Get()
    @ApiOperation({
        summary: 'Get daily habit state',
        description:
            'Returns words practiced today, streak, and goal progress.',
    })
    @ApiResponse({
        status: 200,
        description: 'Daily habit retrieved successfully',
        type: DailyHabitResponseDto,
    })
    getDailyHabit(
        @Req() req: Request & { user: JwtAuthPayload },
        @Query() query: DailyHabitQueryDto,
    ): Promise<DailyHabitResponseDto> {
        return this.dailyHabitService.getDailyHabit(
            req.user.userLoginId,
            query.clientDate,
        );
    }

    @Post('record-practice')
    @ApiOperation({
        summary: 'Record words practiced',
        description:
            'Increments today’s word count and updates the practice streak.',
    })
    @ApiBody({ type: RecordDailyPracticeDto })
    @ApiResponse({
        status: 200,
        description: 'Practice recorded successfully',
        type: DailyHabitResponseDto,
    })
    recordPractice(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: RecordDailyPracticeDto,
    ): Promise<DailyHabitResponseDto> {
        return this.dailyHabitService.recordPractice(
            req.user.userLoginId,
            body,
        );
    }
}
