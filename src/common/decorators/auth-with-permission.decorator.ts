import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermission } from './permission.decorator';

/**
 * JWT 인증 + 권한 체크가 필요한 API에 사용
 * @param menuKey 메뉴 키 (예: 'orderReceiveManage', 'bomInfo' 등)
 * @param action 수행할 액션 ('create', 'read', 'update', 'delete')
 */
export function AuthWithPermission(menuKey: string, action: 'create' | 'read' | 'update' | 'delete') {
    return applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission(menuKey, action),
        ApiBearerAuth('access-token')
    );
}
