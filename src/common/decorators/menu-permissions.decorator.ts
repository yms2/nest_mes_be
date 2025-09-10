import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermission } from './permission.decorator';

/**
 * 수주관리 권한 데코레이터들
 */
export const OrderManagementAuth = {
    create: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('orderReceiveManage', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('orderReceiveManage', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('orderReceiveManage', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('orderReceiveManage', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

/**
 * BOM정보 권한 데코레이터들
 */
export const BomInfoAuth = {
    create: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('bomInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('bomInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('bomInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('bomInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

/**
 * 사업장정보 권한 데코레이터들
 */
export const BusinessInfoAuth = {
    create: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('businessInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('businessInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('businessInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('businessInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

/**
 * 거래처정보 권한 데코레이터들
 */
export const CustomerInfoAuth = {
    create: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('customerInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('customerInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('customerInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('customerInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

/**
 * 품목정보 권한 데코레이터들
 */
export const ProductInfoAuth = {
    create: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('productInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('productInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('productInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('productInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

/**
 * 공정정보 권한 데코레이터들
 */
export const ProcessInfoAuth = {
    create: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('processInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('processInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('processInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('processInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

/**
 * 사원정보 권한 데코레이터들
 */
export const UserInfoAuth = {
    create: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('userInfo', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('userInfo', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('userInfo', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('userInfo', 'delete'),
        ApiBearerAuth('access-token')
    ),
};

/**
 * 권한설정 권한 데코레이터들
 */
export const AuthorityManageAuth = {
    create: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('authorityManage', 'create'),
        ApiBearerAuth('access-token')
    ),
    read: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('authorityManage', 'read'),
        ApiBearerAuth('access-token')
    ),
    update: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('authorityManage', 'update'),
        ApiBearerAuth('access-token')
    ),
    delete: () => applyDecorators(
        UseGuards(JwtAuthGuard, PermissionGuard),
        RequirePermission('authorityManage', 'delete'),
        ApiBearerAuth('access-token')
    ),
};
