import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { authoritymanages } from '../entities/permission.entity';
import { PermissionDeleteDto, BatchPermissionDeleteDto } from '../dto/permission-delete.dto';

@Injectable()
export class PermissionDeleteService {
    constructor(
        @InjectRepository(authoritymanages)
        private readonly permissionRepository: Repository<authoritymanages>,
    ) {}

    async deletePermission(
        id: number,
        deleteReason?: string,
        deletedBy?: string,
    ): Promise<void> {
        const existingPermission = await this.findPermissionById(id);

        // 권한 삭제 전 검증
        await this.validatePermissionDeletion(existingPermission);

        // 권한 삭제
        await this.permissionRepository.remove(existingPermission);

        // 삭제 로그 기록 (필요시)
        await this.logPermissionDeletion(id, deleteReason, deletedBy);
    }

    async batchDeletePermissions(
        ids: number[],
        deleteReason?: string,
        deletedBy?: string,
    ): Promise<void> {
        if (ids.length === 0) {
            throw new BadRequestException('삭제할 권한 ID가 제공되지 않았습니다.');
        }

        // 모든 권한 존재 여부 확인
        const existingPermissions = await this.permissionRepository.findByIds(ids);
        
        if (existingPermissions.length !== ids.length) {
            throw new NotFoundException('일부 권한 정보를 찾을 수 없습니다.');
        }

        // 권한 삭제 전 검증
        for (const permission of existingPermissions) {
            await this.validatePermissionDeletion(permission);
        }

        // 권한 일괄 삭제
        await this.permissionRepository.remove(existingPermissions);

        // 삭제 로그 기록 (필요시)
        await this.logBatchPermissionDeletion(ids, deleteReason, deletedBy);
    }

    async softDeletePermission(
        id: number,
        deleteReason?: string,
        deletedBy?: string,
    ): Promise<void> {
        const existingPermission = await this.findPermissionById(id);

        // 권한 삭제 전 검증
        await this.validatePermissionDeletion(existingPermission);

        // 소프트 삭제 (deletedAt 필드에 삭제 시간 기록)
        const deletedPermission = {
            ...existingPermission,
            deletedAt: new Date(),
            deleteReason,
            deletedBy,
        };

        await this.permissionRepository.save(deletedPermission);
    }

    private async findPermissionById(id: number): Promise<authoritymanages> {
        const permission = await this.permissionRepository.findOne({
            where: { id },
        });

        if (!permission) {
            throw new NotFoundException('권한 정보를 찾을 수 없습니다.');
        }

        return permission;
    }

    private async validatePermissionDeletion(permission: authoritymanages): Promise<void> {
        // 시스템 기본 권한인지 확인 (삭제 방지)
        if (permission.groupName === 'admin' || permission.groupName === 'system') {
            throw new ForbiddenException('시스템 기본 권한은 삭제할 수 없습니다.');
        }

        // 권한 그룹에 사용자가 할당되어 있는지 확인 (필요시)
        // const userCount = await this.userRepository.count({
        //     where: { permissionGroupId: permission.id }
        // });
        // if (userCount > 0) {
        //     throw new BadRequestException('이 권한 그룹에 할당된 사용자가 있어 삭제할 수 없습니다.');
        // }
    }

    private async logPermissionDeletion(
        id: number,
        deleteReason?: string,
        deletedBy?: string,
    ): Promise<void> {
        // 삭제 로그 기록 로직 (필요시 구현)
        console.log(`Permission ${id} deleted by ${deletedBy}, reason: ${deleteReason}`);
    }

    private async logBatchPermissionDeletion(
        ids: number[],
        deleteReason?: string,
        deletedBy?: string,
    ): Promise<void> {
        // 일괄 삭제 로그 기록 로직 (필요시 구현)
        console.log(`Permissions ${ids.join(', ')} deleted by ${deletedBy}, reason: ${deleteReason}`);
    }
}
