import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DevAuthGuard } from '../guards/dev-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermission } from './permission.decorator';

/**
 * 개발환경용 권한 체크 데코레이터 (DevAuth + 권한 체크)
 * @param menuKey 메뉴 키 (예: 'orderReceiveManage', 'bomInfo' 등)
 * @param action 수행할 액션 ('create', 'read', 'update', 'delete')
 */
export function DevAuthWithPermission(menuKey: string, action: 'create' | 'read' | 'update' | 'delete') {
    return applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission(menuKey, action),
        ApiBearerAuth('access-token')
    );
}
