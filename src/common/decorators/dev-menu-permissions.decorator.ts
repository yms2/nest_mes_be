import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DevAuthGuard } from '../guards/dev-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermission } from './permission.decorator';

/**
 * 개발환경용 주문관리 권한 데코레이터들 (DevAuth + 권한 체크)
 */
export const DevOrderManagementAuth = {
    create: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('orderReceiveManage', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('orderReceiveManage', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('orderReceiveManage', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('orderReceiveManage', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

/**
 * 개발환경용 BOM정보 권한 데코레이터들
 */
export const DevBomInfoAuth = {
    create: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('bomInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('bomInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('bomInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('bomInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

/**
 * 개발환경용 사업장정보 권한 데코레이터들
 */
export const DevBusinessInfoAuth = {
    create: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('businessInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('businessInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('businessInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('businessInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

/**
 * 개발환경용 거래처정보 권한 데코레이터들
 */
export const DevCustomerInfoAuth = {
    create: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('customerInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('customerInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('customerInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('customerInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

/**
 * 개발환경용 품목정보 권한 데코레이터들
 */
export const DevProductInfoAuth = {
    create: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('productInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('productInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('productInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('productInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};


/**
 * 개발환경용 공정정보 권한 데코레이터들
 */
export const DevProcessInfoAuth = {
    create: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('processInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('processInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('processInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('processInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

/**
 * 개발환경용 사원정보 권한 데코레이터들
 */
export const DevUserInfoAuth = {
    create: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('userInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('userInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('userInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('userInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

/**
 * 개발환경용 권한설정 권한 데코레이터들
 */
export const DevAuthorityManageAuth = {
    create: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('authorityManage', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('authorityManage', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('authorityManage', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('authorityManage', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

export const DevSettingInfoAuth = {
    create: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('settingInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('settingInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('settingInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('settingInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

export const DevEstimateInfoAuth = {
    create: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('estimateInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('estimateInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('estimateInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('estimateInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

export const DevEquipmentInfoAuth = {
    create: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('equipmentInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('equipmentInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('equipmentInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(DevAuthGuard, PermissionGuard),
        RequirePermission('equipmentInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};