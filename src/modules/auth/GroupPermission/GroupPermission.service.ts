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
      console.log(`그룹 권한 조회 시작: ${groupName}`);
      
      // 1. 권한 조회
      const groupPermission = await this.findGroupPermission(groupName);
      console.log('조회된 권한 데이터:', groupPermission);
      
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
      
      console.log('최종 결과:', result);
      return result;
      
    } catch (error) {
      console.error(`그룹 권한 조회 중 오류 발생: ${groupName}`, error);
      throw error;
    }
  }

  private async findGroupPermission(groupName: string) {
    console.log(`권한 그룹 조회 시도: ${groupName}`);
    
    // 먼저 모든 그룹명을 확인해보기
    const allGroups = await this.permissionRepository.find({
      select: ['group_name'],
    });
    console.log('데이터베이스에 존재하는 그룹명들:', allGroups.map(g => g.group_name));
    
    const groupPermission = await this.permissionRepository.findOne({
      where: { group_name: groupName },
    });

    if (!groupPermission) {
      console.error(`권한 그룹을 찾을 수 없음: ${groupName}`);
      console.error('존재하는 그룹명들:', allGroups.map(g => g.group_name));
      throw new NotFoundException(`권한 그룹 ${groupName}이 존재하지 않습니다.`);
    }

    console.log(`권한 그룹 조회 성공: ${groupName}`, groupPermission);
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
          subMenuData = JSON.parse(groupPermission.sub_menu) as SubMenuPermission[];
        } catch (parseError) {
          console.warn('sub_menu 파싱 실패:', parseError, '원본:', groupPermission.sub_menu);
          subMenuData = [];
        }
      }

      console.log('파싱된 메뉴 데이터:', { mainMenuData, subMenuData });
      
    } catch (error) {
      console.error('메뉴 데이터 파싱 중 예상치 못한 오류:', error, '원본 데이터:', {
        main_menu: groupPermission.main_menu,
        sub_menu: groupPermission.sub_menu
      });
      // 오류 발생 시 빈 배열 반환
      return { mainMenuData: [], subMenuData: [] };
    }

    return { mainMenuData, subMenuData };
  }

  private async fetchMenuData(mainMenuData: MenuPermission[], subMenuData: SubMenuPermission[]) {
    try {
      // 빈 배열 체크
      if (!mainMenuData.length && !subMenuData.length) {
        console.log('메뉴 데이터가 없습니다.');
        return { mainMenus: [], subMenus: [] };
      }

      const allMainMenuIds = Array.from(
        new Set([...mainMenuData.map(m => m.menu_id), ...subMenuData.map(m => m.upper_menu_id)]),
      );

      const allSubMenuIds = subMenuData.map(m => m.menu_id);

      console.log('조회할 메뉴 ID들:', { allMainMenuIds, allSubMenuIds });

      const [mainMenus, subMenus] = await Promise.all([
        this.mainMenuRepository.findBy({ menu_id: In(allMainMenuIds) }),
        this.subMenuRepository.findBy({ menu_id: In(allSubMenuIds) }),
      ]);

      console.log('조회된 메뉴 데이터:', { mainMenus, subMenus });

      return { mainMenus, subMenus };
    } catch (error) {
      console.error('메뉴 데이터 조회 중 오류:', error);
      return { mainMenus: [], subMenus: [] };
    }
  }

  private createMenuMaps(mainMenus: MainMenus[], subMenus: SubMenus[]) {
    try {
      const mainMenuMap = new Map(mainMenus.map(menu => [menu.menu_id, menu.menu_name]));
      const subMenuMap = new Map(
        subMenus.map(menu => [`${menu.upper_menu_id}_${menu.menu_id}`, menu.menu_name]),
      );

      console.log('생성된 메뉴 맵:', { mainMenuMap: Array.from(mainMenuMap), subMenuMap: Array.from(subMenuMap) });

      return { mainMenuMap, subMenuMap };
    } catch (error) {
      console.error('메뉴 맵 생성 중 오류:', error);
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
      console.error('모든 그룹명 조회 중 오류:', error);
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
