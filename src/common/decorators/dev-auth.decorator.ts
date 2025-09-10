import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DevAuthGuard } from '../guards/dev-auth.guard';

/**
 * 개발 환경에서는 인증을 우회하고, 프로덕션에서는 JWT 인증을 사용
 */
export function DevAuth() {
  return applyDecorators(UseGuards(DevAuthGuard), ApiBearerAuth('access-token'));
}
