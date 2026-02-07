import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';

type ServiceHealth = {
    name: string;
    status: 'healthy' | 'unhealthy';
    message: string;
};

@Injectable()
export class AppService {
    constructor(
        @Inject('AUTH_SERVICE_HTTP')
        private readonly authServiceHttp: AxiosInstance,
        @Inject('VOCABULARY_SERVICE_HTTP')
        private readonly vocabularyServiceHttp: AxiosInstance,
    ) {}

    private async getAuthServiceHealth(): Promise<ServiceHealth> {
        const name = 'Auth Service';
        try {
            const response = await this.authServiceHttp.get<string>('/health');
            return {
                name,
                status: 'healthy',
                message: response.data,
            };
        } catch (error) {
            return {
                name,
                status: 'unhealthy',
                message: `error: ${error}`,
            };
        }
    }

    private async getVocabularyServiceHealth(): Promise<ServiceHealth> {
        const name = 'Vocabulary Service';
        try {
            const response =
                await this.vocabularyServiceHttp.get<string>('/health');
            return {
                name,
                status: 'healthy',
                message: response.data,
            };
        } catch (error) {
            return {
                name,
                status: 'unhealthy',
                message: `error: ${error}`,
            };
        }
    }

    async getHealth(): Promise<ServiceHealth[]> {
        const healthStatuses = await Promise.all([
            this.getAuthServiceHealth(),
            this.getVocabularyServiceHealth(),
        ]);

        return healthStatuses;
    }
}
