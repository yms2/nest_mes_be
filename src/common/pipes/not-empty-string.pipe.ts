import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

// 필수값은 빈 문자열을 허용하지 않습니다.
@Injectable()
export class NotEmptyStringPipe implements PipeTransform {
  transform<T = any>(value: T): T {
    if (typeof value === 'string' && value.trim() === '') {
      throw new BadRequestException('필수값은 빈 문자열을 허용하지 않습니다.');
    }
    return value;
  }
}

//파이프는 공통으로 사용하는 것이 좋아서 모듈에 넣지 않고 글로벌로 사용하는 것이 좋다.
