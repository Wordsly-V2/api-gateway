import { ErrorHandlerService } from '@/error-handler/error-handler.service';
import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';

@Injectable()
export class VocabularyService {
  constructor(
    @Inject('VOCABULARY_SERVICE_HTTP')
    private readonly vocabularyServiceHttp: AxiosInstance,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  async getHealth(): Promise<string> {
    try {
      const response = await this.vocabularyServiceHttp.get<string>('/health');
      return response.data;
    } catch (error) {
      throw this.errorHandlerService.translateAxiosError(error);
    }
  }
}
