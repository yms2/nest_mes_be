import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly code?: string,
  ) {
    super(
      {
        message,
        statusCode: status,
        code,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }

  static unauthorized(message: string = '인증이 필요합니다.') {
    return new ApiException(message, HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
  }

  static forbidden(message: string = '접근 권한이 없습니다.') {
    return new ApiException(message, HttpStatus.FORBIDDEN, 'FORBIDDEN');
  }

  static notFound(message: string = '리소스를 찾을 수 없습니다.') {
    return new ApiException(message, HttpStatus.NOT_FOUND, 'NOT_FOUND');
  }

  static badRequest(message: string = '잘못된 요청입니다.') {
    return new ApiException(message, HttpStatus.BAD_REQUEST, 'BAD_REQUEST');
  }

  static internalServerError(message: string = '서버 내부 오류가 발생했습니다.') {
    return new ApiException(message, HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR');
  }
}
