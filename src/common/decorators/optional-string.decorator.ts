import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
//기본 선택값에 대해서 잘못된 경우 날리는 것.
export function OptionalString() {
  return applyDecorators(
    IsOptional(),
    IsString({ message: '문자열이어야 합니다.' }),
  );
}