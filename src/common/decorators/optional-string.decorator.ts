import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsString, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export function OptionalString() {
  return applyDecorators(
    // 빈 문자열이면 undefined로 변경
    Transform(({ value }) => value === '' ? undefined : value),

    // 값이 undefined가 아닐 때만 아래 검증 수행
    ValidateIf((obj, value) => value !== undefined),

    // 실제 유효성 검사
    IsOptional(),
    IsString({ message: '문자열이어야 합니다.' }),
  );
}
