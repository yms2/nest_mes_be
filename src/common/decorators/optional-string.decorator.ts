import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
export function OptionalString() {
  return applyDecorators(
    IsOptional(),
    IsString({ message: '문자열이어야 합니다.' }),
  );
}