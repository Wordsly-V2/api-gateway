import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    BatchRecordDailyPracticeDto,
    DailyHabitQueryDto,
    DailyHabitResponseDto,
    RecordDailyPracticeDto,
    UpdateDailyGoalDto,
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

    @Post('record-practice/batch')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Record words practiced across several days',
        description:
            'For clients flushing sessions collected offline over more than one calendar day. Streaks are recomputed from the full day history, so a backdated day can fill a gap.',
    })
    @ApiBody({ type: BatchRecordDailyPracticeDto })
    @ApiResponse({
        status: 200,
        description: 'Practice recorded successfully',
        type: DailyHabitResponseDto,
    })
    recordPracticeBatch(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: BatchRecordDailyPracticeDto,
    ): Promise<DailyHabitResponseDto> {
        return this.dailyHabitService.recordPracticeBatch(
            req.user.userLoginId,
            body,
        );
    }

    @Patch('goal')
    @ApiOperation({
        summary: 'Update daily word goal',
    })
    @ApiBody({ type: UpdateDailyGoalDto })
    @ApiResponse({
        status: 200,
        description: 'Daily goal updated successfully',
        type: DailyHabitResponseDto,
    })
    updateDailyGoal(
        @Req() req: Request & { user: JwtAuthPayload },
        @Body() body: UpdateDailyGoalDto,
        @Query() query: DailyHabitQueryDto,
    ): Promise<DailyHabitResponseDto> {
        return this.dailyHabitService.updateDailyGoal(
            req.user.userLoginId,
            body,
            query.clientDate,
        );
    }
}
