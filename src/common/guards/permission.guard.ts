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
        // 메타데이터에서 권한 정보 가져오기
        const permission = this.reflector.get<PermissionMetadata>('permission', context.getHandler());
        
        console.log('🔍 PermissionGuard 실행됨');
        console.log('📋 권한 메타데이터:', permission);
        
        if (!permission) {
            console.log('⚠️ 권한 체크 없음 - 통과');
            return true; // 권한 체크가 없으면 통과
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        console.log('👤 사용자 정보:', user);

        if (!user || !user.group_name) {
            throw new ForbiddenException('사용자 정보를 찾을 수 없습니다.');
        }

        // 권한 확인
        const hasPermission = await this.checkPermission(user.group_name, permission.menuKey, permission.action);
        
        console.log('🎯 권한 체크 결과:', hasPermission);
        
        if (!hasPermission) {
            const actionText = {
                'create': '등록',
                'read': '조회', 
                'update': '수정',
                'delete': '삭제'
            }[permission.action];
            
            console.log('❌ 권한 없음 - 403 에러 발생');
            throw new ForbiddenException(`${user.group_name} 그룹은 ${permission.menuKey} ${actionText} 권한이 없습니다.`);
        }

        console.log('✅ 권한 있음 - 통과');
        return true;
    }

    private async checkPermission(groupName: string, menuKey: string, action: string): Promise<boolean> {
        try {
            console.log(`🔍 권한 체크 시작 - 그룹: ${groupName}, 메뉴키: ${menuKey}, 액션: ${action}`);
            
            // 사용자 그룹의 권한 정보 조회
            const authority = await this.authorityManagesRepository.findOne({
                where: { groupName }
            });

            if (!authority) {
                console.log('❌ 권한 정보 없음');
                return false;
            }

            console.log('✅ 권한 정보 조회 성공');

            // subMenu JSON 파싱
            const subMenuData = this.parseSubMenu(authority.subMenu);
            console.log(`📊 파싱된 메뉴 데이터 개수: ${subMenuData.length}`);
            
            // 해당 메뉴 찾기
            console.log(`🔍 찾는 메뉴키: ${menuKey}`);
            console.log(`📋 전체 메뉴 목록:`, subMenuData.map(item => ({
                key: item.key,
                menu_name: item.menu_name,
                create: item.create,
                read: item.read,
                update: item.update,
                delete: item.delete
            })));
            
            const menu = subMenuData?.find((item: any) => 
                item.key === menuKey || item.menu_name === menuKey
            );

            if (!menu) {
                console.log(`❌ 메뉴를 찾을 수 없음: ${menuKey}`);
                return false;
            }

            console.log(`✅ 메뉴 찾음:`, menu);
            console.log(`🔑 ${action} 권한 값:`, menu[action]);

            // 권한 확인
            const hasPermission = menu[action] === "t";
            console.log(`🎯 최종 권한 결과: ${hasPermission}`);
            
            return hasPermission;
        } catch (error) {
            console.log(`❌ 권한 확인 오류:`, error.message);
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
