import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorityManages } from '../entities/permission.entity';
import { PermissionUpdateDto, MenuPermissionUpdateDto } from '../dto/permission-update.dto';

@Injectable()
export class PermissionUpdateService {
    constructor(
        @InjectRepository(AuthorityManages)
        private readonly permissionRepository: Repository<AuthorityManages>,
    ) {}

    async updatePermission(
        id: number,
        updateDto: PermissionUpdateDto,
        updatedBy: string,
    ): Promise<AuthorityManages> {
        const existingPermission = await this.findPermissionById(id);

        // 디버깅: 기존 데이터 로그
        console.log('기존 권한 데이터:', {
            id: existingPermission.id,
            allGrant: existingPermission.allGrant,
            groupName: existingPermission.groupName,
            mainMenu: existingPermission.mainMenu,
            subMenu: existingPermission.subMenu,
        });

        // 디버깅: 업데이트할 데이터 로그
        console.log('업데이트할 데이터:', updateDto);

        // 권한 검증
        await this.validatePermissionUpdate(updateDto);

        // 업데이트할 필드만 선택적으로 업데이트
        const updatedPermission = {
            ...existingPermission,
            allGrant: updateDto.allGrant || existingPermission.allGrant,
            groupName: updateDto.groupName || existingPermission.groupName,
            mainMenu: updateDto.mainMenu || existingPermission.mainMenu,
            subMenu: updateDto.subMenu || existingPermission.subMenu,
            updatedAt: new Date(),
        };

        // 디버깅: 최종 업데이트 데이터 로그
        console.log('최종 업데이트 데이터:', {
            id: updatedPermission.id,
            allGrant: updatedPermission.allGrant,
            groupName: updatedPermission.groupName,
            mainMenu: updatedPermission.mainMenu,
            subMenu: updatedPermission.subMenu,
        });

        const result = await this.permissionRepository.save(updatedPermission);
        
        // 디버깅: 저장된 결과 로그
        console.log('저장된 결과:', {
            id: result.id,
            allGrant: result.allGrant,
            groupName: result.groupName,
            mainMenu: result.mainMenu,
            subMenu: result.subMenu,
        });

        return result;
    }

    async updateMenuPermissions(
        groupId: number,
        mainMenuIds: number[],
        subMenuIds: number[],
        updatedBy: string,
    ): Promise<void> {
        const existingPermission = await this.findPermissionById(groupId);

        // 메뉴 권한 업데이트
        const updatedPermission = {
            ...existingPermission,
            mainMenu: JSON.stringify(mainMenuIds),
            subMenu: JSON.stringify(subMenuIds),
            updatedAt: new Date(),
        };

        await this.permissionRepository.save(updatedPermission);
    }

    private async findPermissionById(id: number): Promise<AuthorityManages> {
        const permission = await this.permissionRepository.findOne({
            where: { id },
        });

        if (!permission) {
            throw new NotFoundException('권한 정보를 찾을 수 없습니다.');
        }

        return permission;
    }

    private async validatePermissionUpdate(updateDto: PermissionUpdateDto): Promise<void> {
        // 메뉴 권한 유효성 검사
        try {
            if (updateDto.mainMenu) {
                JSON.parse(updateDto.mainMenu);
            }
            if (updateDto.subMenu) {
                JSON.parse(updateDto.subMenu);
            }
        } catch (error) {
            throw new BadRequestException('메뉴 권한은 유효한 JSON 형식이어야 합니다.');
        }
    }
}
