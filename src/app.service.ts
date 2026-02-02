import { Inject, Injectable } from '@nestjs/common';
import { ErrorHandlerService } from './error-handler/error-handler.service';
import type { AxiosInstance } from 'axios';

type ServiceHealth = {
  name: string;
  status: string;
};

@Injectable()
export class AppService {
  constructor(
    @Inject('AUTH_SERVICE_HTTP')
    private readonly authServiceHttp: AxiosInstance,
    @Inject('VOCABULARY_SERVICE_HTTP')
    private readonly vocabularyServiceHttp: AxiosInstance,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  private async getAuthServiceHealth(): Promise<ServiceHealth> {
    const name = 'Auth Service';
    try {
      const response = await this.authServiceHttp.get<string>('/health');
      return {
        name,
        status: response.data,
      };
    } catch (error) {
      return {
        name,
        status: `Unhealthy - ${error}`,
      };
    }
  }

  private async getVocabularyServiceHealth(): Promise<ServiceHealth> {
    const name = 'Vocabulary Service';
    try {
      const response = await this.vocabularyServiceHttp.get<string>('/health');
      return {
        name,
        status: response.data,
      };
    } catch (error) {
      return {
        name,
        status: `Unhealthy - ${error}`,
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
