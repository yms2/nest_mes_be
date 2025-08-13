import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { authoritymanages } from './GroupPermission.entity';
import { MainMenus } from './MainMenu.entity';
import { SubMenus } from './SubMenu.entity';
import { In, Repository } from 'typeorm';
import {
  GroupPermissionResponse,
  MenuPermission,
  SubMenuPermission,
} from './interfaces/permission.interface';

@Injectable()
export class GroupPermissionService {
  constructor(
    @InjectRepository(authoritymanages)
    private readonly permissionRepository: Repository<authoritymanages>,
    @InjectRepository(MainMenus)
    private readonly mainMenuRepository: Repository<MainMenus>,
    @InjectRepository(SubMenus)
    private readonly subMenuRepository: Repository<SubMenus>,
  ) {}

  async getPermissionsByGroup(groupName: string): Promise<GroupPermissionResponse> {
    try {
      // 1. 권한 조회
      const groupPermission = await this.findGroupPermission(groupName);
      
      // 2. JSON 파싱
      const { mainMenuData, subMenuData } = this.parsePermissionData(groupPermission);
      
      // 3. 메뉴 데이터 조회
      const { mainMenus, subMenus } = await this.fetchMenuData(mainMenuData, subMenuData);
      
      // 4. 데이터 변환
      const { mainMenuMap, subMenuMap } = this.createMenuMaps(mainMenus, subMenus);
      
      // 5. 결과 조합
      const result = this.buildPermissionResponse(
        groupPermission,
        mainMenuData,
        subMenuData,
        mainMenuMap,
        subMenuMap,
      );
      
      return result;
      
    } catch (error) {
      throw error;
    }
  }

  private async findGroupPermission(groupName: string) {
    const groupPermission = await this.permissionRepository.findOne({
      where: { group_name: groupName },
    });

    if (!groupPermission) {
      throw new NotFoundException(`권한 그룹 ${groupName}이 존재하지 않습니다.`);
    }

    return groupPermission;
  }

  private parsePermissionData(groupPermission: authoritymanages) {
    let mainMenuData: MenuPermission[] = [];
    let subMenuData: SubMenuPermission[] = [];

    try {
      // main_menu 파싱
      if (groupPermission.main_menu && groupPermission.main_menu.trim() !== '' && groupPermission.main_menu !== 'null') {
        try {
          mainMenuData = JSON.parse(groupPermission.main_menu) as MenuPermission[];
        } catch (parseError) {
          console.warn('main_menu 파싱 실패:', parseError, '원본:', groupPermission.main_menu);
          mainMenuData = [];
        }
      }

      // sub_menu 파싱
      if (groupPermission.sub_menu && groupPermission.sub_menu.trim() !== '' && groupPermission.sub_menu !== 'null') {
        try {
          // JSON 문자열 정리
          let cleanSubMenu = groupPermission.sub_menu
            .replace(/\r\n/g, '')  // 캐리지 리턴과 라인 피드 제거
            .replace(/\n/g, '')    // 라인 피드 제거
            .replace(/\r/g, '')    // 캐리지 리턴 제거
            .replace(/\s+/g, ' ')  // 연속된 공백을 하나로
            .trim();               // 앞뒤 공백 제거
          
          // 마지막에 있는 중복된 ] 제거
          if (cleanSubMenu.endsWith(']]')) {
            cleanSubMenu = cleanSubMenu.slice(0, -1);
          }
          
          subMenuData = JSON.parse(cleanSubMenu) as SubMenuPermission[];
        } catch (parseError) {
          subMenuData = [];
        }
      }
      
    } catch (error) {
      // 오류 발생 시 빈 배열 반환
      return { mainMenuData: [], subMenuData: [] };
    }

    return { mainMenuData, subMenuData };
  }

  private async fetchMenuData(mainMenuData: MenuPermission[], subMenuData: SubMenuPermission[]) {
    try {
      // 빈 배열 체크
      if (!mainMenuData.length && !subMenuData.length) {
        return { mainMenus: [], subMenus: [] };
      }

      const allMainMenuIds = Array.from(
        new Set([...mainMenuData.map(m => m.menu_id), ...subMenuData.map(m => m.upper_menu_id)]),
      );

      const allSubMenuIds = subMenuData.map(m => m.menu_id);

      const [mainMenus, subMenus] = await Promise.all([
        this.mainMenuRepository.findBy({ menu_id: In(allMainMenuIds) }),
        this.subMenuRepository.findBy({ menu_id: In(allSubMenuIds) }),
      ]);

      return { mainMenus, subMenus };
    } catch (error) {
      return { mainMenus: [], subMenus: [] };
    }
  }

  private createMenuMaps(mainMenus: MainMenus[], subMenus: SubMenus[]) {
    try {
      const mainMenuMap = new Map(mainMenus.map(menu => [menu.menu_id, menu.menu_name]));
      const subMenuMap = new Map(
        subMenus.map(menu => [`${menu.upper_menu_id}_${menu.menu_id}`, menu.menu_name]),
      );

      return { mainMenuMap, subMenuMap };
    } catch (error) {
      return { mainMenuMap: new Map(), subMenuMap: new Map() };
    }
  }

  async getAllGroups(): Promise<string[]> {
    try {
      const allGroups = await this.permissionRepository.find({
        select: ['group_name'],
      });
      return allGroups.map(g => g.group_name);
    } catch (error) {
      throw error;
    }
  }

  private buildPermissionResponse(
    groupPermission: authoritymanages,
    mainMenuData: MenuPermission[],
    subMenuData: SubMenuPermission[],
    mainMenuMap: Map<string, string>,
    subMenuMap: Map<string, string>,
  ): GroupPermissionResponse {
    const mainMenuResult = mainMenuData.map(item => ({
      menu_id: item.menu_id,
      menu_name: mainMenuMap.get(item.menu_id) || '',
      view: item.view,
      key: item.key,
      create: item.create,
      read: item.read,
      update: item.update,
      delete: item.delete,
      rowCount: item.rowCount,
    }));

    const subMenuResult = subMenuData.map(item => ({
      upper_menu_id: item.upper_menu_id,
      upper_menu_name: mainMenuMap.get(item.upper_menu_id) || '',
      menu_id: item.menu_id,
      menu_name: subMenuMap.get(`${item.upper_menu_id}_${item.menu_id}`) || '',
      view: item.view,
      key: item.key,
      create: item.create,
      read: item.read,
      update: item.update,
      delete: item.delete,
      rowCount: item.rowCount,
    }));

    return {
      id: groupPermission.id,
      all_grant: groupPermission.all_grant,
      group_name: groupPermission.group_name,
      main_menu: { data: mainMenuResult },
      sub_menu: { data: subMenuResult },
    };
  }
}
