import { SetMetadata } from '@nestjs/common';
import { PermissionMetadata } from '../guards/permission.guard';

/**
 * 권한 체크를 위한 메타데이터 데코레이터
 * @param menuKey 메뉴 키 (예: 'orderReceiveManage', 'bomInfo' 등)
 * @param action 수행할 액션 ('create', 'read', 'update', 'delete')
 */
export const RequirePermission = (menuKey: string, action: 'create' | 'read' | 'update' | 'delete') =>
    SetMetadata('permission', { menuKey, action });
