import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { authoritymanages } from './GroupPermission.entity';
import { MainMenus } from './MainMenu.entity';
import { SubMenus } from './SubMenu.entity';
import { In, Repository } from 'typeorm';

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

  async getPermissionsByGroup(groupName: string) {
    const groupPermission = await this.permissionRepository.findOne({
      where: { group_name: groupName },
    });

    if (!groupPermission) {
      throw new NotFoundException(`권한 그룹 ${groupName}이 존재하지 않습니다.`);
    }

    let mainMenuData: { menu_id: string }[] = [];
    let subMenuData: {
      upper_menu_id: string;
      menu_id: string;
    }[] = [];

    try {
      mainMenuData = JSON.parse(groupPermission.main_menu || '[]') as { menu_id: string }[];
      subMenuData = JSON.parse(groupPermission.sub_menu || '[]') as {
        upper_menu_id: string;
        menu_id: string;
      }[];
    } catch {
      throw new InternalServerErrorException('메뉴 데이터 파싱 실패');
    }

    const allMainMenuIds = Array.from(
      new Set([...mainMenuData.map(m => m.menu_id), ...subMenuData.map(m => m.upper_menu_id)]),
    );

    const allSubMenuIds = subMenuData.map(m => m.menu_id);

    const [mainMenus, subMenus] = await Promise.all([
      this.mainMenuRepository.findBy({ menu_id: In(allMainMenuIds) }),
      this.subMenuRepository.findBy({ menu_id: In(allSubMenuIds) }),
    ]);

    const mainMenuMap = new Map(mainMenus.map(menu => [menu.menu_id, menu.menu_name]));
    const subMenuMap = new Map(
      subMenus.map(menu => [`${menu.upper_menu_id}_${menu.menu_id}`, menu.menu_name]),
    );

    const mainMenuResult = mainMenuData.map(item => ({
      menu_id: item.menu_id,
      menu_name: mainMenuMap.get(item.menu_id) || '',
    }));

    const subMenuResult = subMenuData.map(item => ({
      upper_menu_id: item.upper_menu_id,
      upper_menu_name: mainMenuMap.get(item.upper_menu_id) || '',
      menu_id: item.menu_id,
      menu_name: subMenuMap.get(`${item.upper_menu_id}_${item.menu_id}`) || '',
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
