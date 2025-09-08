import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorityManages } from '../../modules/base-info/permission-info/entities/permission.entity';

export interface PermissionMetadata {
    menuKey: string;
    action: 'create' | 'read' | 'update' | 'delete';
}

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectRepository(AuthorityManages)
        private readonly authorityManagesRepository: Repository<AuthorityManages>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const permission = this.reflector.get<PermissionMetadata>('permission', context.getHandler());
        
        if (!permission) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.group_name) {
            throw new ForbiddenException('사용자 정보를 찾을 수 없습니다.');
        }

        const hasPermission = await this.checkPermission(user.group_name, permission.menuKey, permission.action);
        
        if (!hasPermission) {
            const actionText = {
                'create': '등록',
                'read': '조회', 
                'update': '수정',
                'delete': '삭제'
            }[permission.action];
            
            throw new ForbiddenException(`${user.group_name} 그룹은 ${permission.menuKey} ${actionText} 권한이 없습니다.`);
        }

        return true;
    }

    private async checkPermission(groupName: string, menuKey: string, action: string): Promise<boolean> {
        try {
            const authority = await this.authorityManagesRepository.findOne({
                where: { groupName }
            });

            if (!authority) {
                return false;
            }

            const subMenuData = this.parseSubMenu(authority.subMenu);
            
            const menu = subMenuData?.find((item: any) => 
                item.key === menuKey || item.menu_name === menuKey
            );

            if (!menu) {
                return false;
            }

            return menu[action] === "t";
        } catch (error) {
            return false;
        }
    }

    private parseSubMenu(subMenuJson: string): any[] {
        if (!subMenuJson || subMenuJson.trim() === '') {
            return [];
        }

        try {
            // JSON 문자열 정리
            let cleanedJson = subMenuJson.trim();
            
            // 잘못된 JSON 형식 수정
            while (cleanedJson.endsWith(']]')) {
                cleanedJson = cleanedJson.slice(0, -1);
            }
            
            // JSON 배열의 올바른 끝 찾기
            let bracketCount = 0;
            let validEndIndex = -1;
            
            for (let i = 0; i < cleanedJson.length; i++) {
                if (cleanedJson[i] === '[') {
                    bracketCount++;
                } else if (cleanedJson[i] === ']') {
                    bracketCount--;
                    if (bracketCount === 0) {
                        validEndIndex = i;
                        break;
                    }
                }
            }
            
            if (validEndIndex !== -1 && validEndIndex < cleanedJson.length - 1) {
                cleanedJson = cleanedJson.substring(0, validEndIndex + 1);
            }
            
            // JSON 파싱
            const parsed = JSON.parse(cleanedJson);
            
            if (parsed && parsed.data && Array.isArray(parsed.data)) {
                return parsed.data;
            } else if (Array.isArray(parsed)) {
                return parsed;
            }
            
            return [];
        } catch (error) {
            // JSON 파싱 실패 시 빈 배열 반환
            return [];
        }
    }
}
