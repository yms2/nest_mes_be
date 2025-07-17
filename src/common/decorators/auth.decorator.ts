import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

/**
 * JWT 인증이 필요한 API에 사용
 */
export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard), ApiBearerAuth('access-token'));
}
