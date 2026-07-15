import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    ActivityCalendarQueryDto,
    ActivityCalendarResponseDto,
    LearningReportQueryDto,
    LearningReportResponseDto,
    ReviewForecastQueryDto,
    ReviewForecastResponseDto,
} from './dto/learning-report.dto';
import { LearningReportService } from './learning-report.service';

@ApiTags('learning-report')
@Controller('learning-report')
@UseGuards(JwtAuthGuard)
export class LearningReportController {
    constructor(
        private readonly learningReportService: LearningReportService,
    ) {}

    @Get()
    @ApiOperation({
        summary: 'Get the learning progress report',
        description:
            'Time-bucketed words/accuracy/consistency trends, mastery snapshot, streaks and achievements for the chosen period.',
    })
    @ApiResponse({
        status: 200,
        description: 'Report generated successfully',
        type: LearningReportResponseDto,
    })
    getReport(
        @Req() req: Request & { user: JwtAuthPayload },
        @Query() query: LearningReportQueryDto,
    ): Promise<LearningReportResponseDto> {
        return this.learningReportService.getReport(
            req.user.userLoginId,
            query.period,
            query.clientDate,
        );
    }

    @Get('forecast')
    @ApiOperation({
        summary: 'Get the upcoming review workload forecast',
        description:
            'Reviews already overdue plus per-day scheduled review counts for the next 7 or 30 days.',
    })
    @ApiResponse({
        status: 200,
        description: 'Forecast generated successfully',
        type: ReviewForecastResponseDto,
    })
    getForecast(
        @Req() req: Request & { user: JwtAuthPayload },
        @Query() query: ReviewForecastQueryDto,
    ): Promise<ReviewForecastResponseDto> {
        return this.learningReportService.getForecast(
            req.user.userLoginId,
            query.days,
            query.clientDate,
        );
    }

    @Get('activity-calendar')
    @ApiOperation({
        summary: 'Get the practice activity calendar',
        description:
            'Per-day words practiced and goal-met flags over the trailing year.',
    })
    @ApiResponse({
        status: 200,
        description: 'Activity calendar generated successfully',
        type: ActivityCalendarResponseDto,
    })
    getActivityCalendar(
        @Req() req: Request & { user: JwtAuthPayload },
        @Query() query: ActivityCalendarQueryDto,
    ): Promise<ActivityCalendarResponseDto> {
        return this.learningReportService.getActivityCalendar(
            req.user.userLoginId,
            query.clientDate,
        );
    }
}
