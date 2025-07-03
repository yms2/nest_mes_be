import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { authoritymanages } from './GroupPermission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GroupPermissionService {
  constructor(
    @InjectRepository(authoritymanages)
    private readonly permissionRepository: Repository<authoritymanages>,
  ) {}

  async getPermissionsByGroup(groupName: string) {
    const groupPermission = await this.permissionRepository.findOne({
      where: { group_name: groupName },
    });

    if (!groupPermission) {
      throw new NotFoundException(`권한 그룹 ${groupName}이 존재하지 않습니다.`);
    }

    return {
      main_menu: groupPermission.main_menu,
      sub_menu: groupPermission.sub_menu,
      all_grant: groupPermission.all_grant,
    };
  }
}
