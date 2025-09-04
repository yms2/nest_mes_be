import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { PermissionReadService } from '../services/permission-read.service';
import { DevAuthorityManageAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { AuthorityManages } from '../entities/permission.entity';

@ApiTags('권한관리')
@Controller('permission-info')
@UseInterceptors(ClassSerializerInterceptor)
export class PermissionReadController {
  constructor(private readonly permissionReadService: PermissionReadService) {}

  // ===== 권한 관리 정보 조회 =====
  
  @Get()
  @DevAuthorityManageAuth.read()
  @ApiOperation({ 
    summary: '모든 권한 관리 정보 조회', 
    description: '모든 권한 관리 정보를 조회합니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '권한 관리 정보 조회 성공',
    type: [AuthorityManages]
  })
  async getAllAuthorityManages() {
    return this.permissionReadService.getAuthorityManages();
  }

  @Get('/group/:groupName')
  @ApiOperation({ 
    summary: '그룹명으로 권한 관리 정보 조회', 
    description: '특정 그룹명의 권한 관리 정보를 조회합니다.' 
  })
  @ApiParam({ name: 'groupName', description: '그룹명', type: String })
  @ApiResponse({ 
    status: 200, 
    description: '권한 관리 정보 조회 성공',
    type: [AuthorityManages]
  })
  async getAuthorityManagesByGroupName(@Param('groupName') groupName: string) {
    return this.permissionReadService.getAuthorityManagesByGroupName(groupName);
  }
}
