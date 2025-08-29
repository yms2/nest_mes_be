import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorityManages } from '../entities/permission.entity';
import { MainMenus } from '../../../auth/GroupPermission/entity/MainMenu.entity';
import { SubMenus } from '../../../auth/GroupPermission/entity/SubMenu.entity';

@Injectable()
export class PermissionReadService {
    constructor(
        @InjectRepository(AuthorityManages)
        private readonly authoritymanagesRepository: Repository<AuthorityManages>,
        @InjectRepository(SubMenus)
        private readonly subMenuRepository: Repository<SubMenus>,
        @InjectRepository(MainMenus)
        private readonly mainMenuRepository: Repository<MainMenus>,
    ) {}

    /**
     * 안전한 JSON 파싱 함수
     * @param jsonString JSON 문자열
     * @returns 파싱된 객체 또는 null
     */
    private safeJsonParse(jsonString: string): any {
        if (!jsonString || jsonString.trim() === '') {
            return null;
        }
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('JSON 파싱 오류:', error);
            return null;
        }
    }

    /**
     * 권한 관리 정보를 처리하여 메뉴 데이터를 파싱
     * @param authorityManage 권한 관리 정보
     * @returns 처리된 권한 관리 정보
     */
    private processAuthorityManage(authorityManage: AuthorityManages): any {
        return {
            ...authorityManage,
            mainMenu: this.safeJsonParse(authorityManage.mainMenu),
            subMenu: this.safeJsonParse(authorityManage.subMenu)
        };
    }

    async getAuthorityManages() {
        const authorities = await this.authoritymanagesRepository.find();
        return authorities.map(item => this.processAuthorityManage(item));
    }

    /**
     * 그룹명으로 권한 관리 정보 조회
     * @param groupName 조회할 그룹명
     * @returns 해당 그룹의 권한 관리 정보 배열
     */
    async getAuthorityManagesByGroupName(groupName: string) {
        const authorities = await this.authoritymanagesRepository.find({
            where: { groupName },
            order: { id: 'ASC' }
        });
        return authorities.map(item => this.processAuthorityManage(item));
    }

    /**
     * 특정 그룹명이 존재하는지 확인
     * @param groupName 확인할 그룹명
     * @returns 존재 여부
     */
    async isGroupNameExists(groupName: string): Promise<boolean> {
        const count = await this.authoritymanagesRepository.count({
            where: { groupName }
        });
        return count > 0;
    }

    /**
     * 모든 고유한 그룹명 조회
     * @returns 고유한 그룹명 배열
     */
    async getAllUniqueGroupNames(): Promise<string[]> {
        const authorities = await this.authoritymanagesRepository.find({
            select: ['groupName'],
            order: { groupName: 'ASC' }
        });
        
        // 중복 제거
        const uniqueGroupNames = [...new Set(authorities.map(auth => auth.groupName))];
        return uniqueGroupNames;
    }

    async getSubMenu() {
        return this.subMenuRepository.find();
    }

    async getMainMenu() {
        return this.mainMenuRepository.find();
    }

}