import {
  BadRequestException,
  ForbiddenException,
  GatewayTimeoutException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AxiosError } from 'axios';

export type ServiceError =
  | {
      type: 'http';
      statusCode: HttpStatus;
      message?: string;
    }
  | {
      type: 'rpc';
      errorCode: string;
      errorMessage?: string;
    };

@Injectable()
export class ErrorHandlerService {
  handleHttpError({
    statusCode,
    message,
  }: {
    statusCode: HttpStatus;
    message?: string;
  }):
    | BadRequestException
    | ForbiddenException
    | GatewayTimeoutException
    | NotFoundException
    | UnauthorizedException
    | InternalServerErrorException {
    switch (statusCode) {
      case HttpStatus.NOT_FOUND: {
        return new NotFoundException(message);
      }
      case HttpStatus.UNAUTHORIZED: {
        return new UnauthorizedException(message);
      }
      case HttpStatus.FORBIDDEN: {
        return new ForbiddenException(message);
      }
      case HttpStatus.GATEWAY_TIMEOUT: {
        return new GatewayTimeoutException(message);
      }
      case HttpStatus.BAD_REQUEST: {
        return new BadRequestException(message);
      }
      default: {
        return new InternalServerErrorException(message);
      }
    }
  }

  handleRpcError({
    errorCode,
    errorMessage,
  }: {
    errorCode: string;
    errorMessage?: string;
  }):
    | BadRequestException
    | ForbiddenException
    | GatewayTimeoutException
    | NotFoundException
    | UnauthorizedException
    | InternalServerErrorException {
    switch (errorCode) {
      case 'NOT_FOUND': {
        return new NotFoundException(errorMessage);
      }
      case 'UNAUTHORIZED': {
        return new UnauthorizedException(errorMessage);
      }
      case 'FORBIDDEN': {
        return new ForbiddenException(errorMessage);
      }
      case 'GATEWAY_TIMEOUT': {
        return new GatewayTimeoutException(errorMessage);
      }
      case 'BAD_REQUEST': {
        return new BadRequestException(errorMessage);
      }
      default: {
        return new InternalServerErrorException(errorMessage);
      }
    }
  }

  translateAxiosError(error: AxiosError) {
    if (!error.response) {
      return this.handleHttpError({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unknown error',
      });
    }

    const response = error.response as {
      status: HttpStatus;
      data: { message?: string };
    };

    return this.handleHttpError({
      statusCode: response.status,
      message: response.data.message,
    });
  }
}
