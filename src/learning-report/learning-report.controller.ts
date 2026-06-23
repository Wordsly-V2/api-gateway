import { JwtAuthPayload } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth/jwt-auth.guard';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    LearningReportQueryDto,
    LearningReportResponseDto,
} from './dto/learning-report.dto';
import { LearningReportService } from './learning-report.service';

@ApiTags('learning-report')
@Controller('learning-report')
@UseGuards(JwtAuthGuard)
export class LearningReportController {
    constructor(private readonly learningReportService: LearningReportService) {}

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
}
