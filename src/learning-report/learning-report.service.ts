import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import {
    LearningReportResponseDto,
    ReportPeriod,
} from './dto/learning-report.dto';

@Injectable()
export class LearningReportService {
    constructor(
        @Inject('LEARNING_SERVICE_HTTP')
        private readonly learningServiceHttp: AxiosInstance,
        private readonly errorHandlerService: ErrorHandlerService,
    ) {}

    async getReport(
        userLoginId: string,
        period?: ReportPeriod,
        clientDate?: string,
    ): Promise<LearningReportResponseDto> {
        try {
            const response =
                await this.learningServiceHttp.get<LearningReportResponseDto>(
                    `/users/${userLoginId}/learning-report`,
                    { params: { period, clientDate } },
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
