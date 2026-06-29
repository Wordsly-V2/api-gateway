import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import { UserLevelResponseDto } from './dto/user-level.dto';

@Injectable()
export class UserLevelService {
    constructor(
        @Inject('LEARNING_SERVICE_HTTP')
        private readonly learningServiceHttp: AxiosInstance,
        private readonly errorHandlerService: ErrorHandlerService,
    ) {}

    async getUserLevel(userLoginId: string): Promise<UserLevelResponseDto> {
        try {
            const response =
                await this.learningServiceHttp.get<UserLevelResponseDto>(
                    `/users/${userLoginId}/level`,
                );
            return response.data;
        } catch (error) {
            throw this.errorHandlerService.translateAxiosError(error);
        }
    }
}
