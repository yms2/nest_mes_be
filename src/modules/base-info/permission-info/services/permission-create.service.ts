import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorityManages } from '../entities/permission.entity';
import { PermissionCreateDto } from '../dto/permission-create.dto';

@Injectable()
export class PermissionCreateService {
    constructor(
        @InjectRepository(AuthorityManages)
        private readonly permissionRepository: Repository<AuthorityManages>,
    ) {}

    async createPermission(
        createDto: PermissionCreateDto,
    ): Promise<AuthorityManages> {
        // 권한 검증
        await this.validatePermissionCreation(createDto);

        // 새 권한 생성
        const newPermission = this.permissionRepository.create({
            ...createDto,
        });

        // 권한 저장
        const result = await this.permissionRepository.save(newPermission);
        
        console.log('새로 생성된 권한:', {
            id: result.id,
            allGrant: result.allGrant,
            groupName: result.groupName,
            mainMenu: result.mainMenu,
            subMenu: result.subMenu,
        });

        return result;
    }

    private async validatePermissionCreation(createDto: PermissionCreateDto): Promise<void> {
        // 그룹명 중복 확인
        const existingPermission = await this.permissionRepository.findOne({
            where: { groupName: createDto.groupName }
        });

        if (existingPermission) {
            throw new ConflictException('이미 존재하는 권한 그룹명입니다.');
        }

        // 메뉴 권한 유효성 검사
        try {
            if (createDto.mainMenu) {
                JSON.parse(createDto.mainMenu);
            }
            if (createDto.subMenu) {
                JSON.parse(createDto.subMenu);
            }
        } catch (error) {
            throw new BadRequestException('메뉴 권한은 유효한 JSON 형식이어야 합니다.');
        }

        // 필수 필드 검증
        if (!createDto.allGrant || !createDto.groupName) {
            throw new BadRequestException('allGrant와 groupName은 필수 필드입니다.');
        }

        // allGrant 값 검증
        const validAllGrantValues = ['all', 'none', 'custom'];
        if (!validAllGrantValues.includes(createDto.allGrant)) {
            throw new BadRequestException('allGrant는 "all", "none", "custom" 중 하나여야 합니다.');
        }
    }
}
