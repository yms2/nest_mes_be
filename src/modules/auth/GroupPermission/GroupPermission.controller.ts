import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { GroupPermissionService } from './GroupPermission.service';

@ApiTags('GroupPermission')
@Controller('groupauthority')
export class GroupPermissionController {
  constructor(private readonly groupPermissionService: GroupPermissionService) {}

  @Get('debug/all-groups')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '모든 그룹명 조회 (디버깅용)',
    description: '데이터베이스에 존재하는 모든 그룹명을 조회합니다.',
  })
  async getAllGroups() {
    try {
      const allGroups = await this.groupPermissionService.getAllGroups();
      return {
        result: true,
        message: '모든 그룹명 조회 성공',
        data: allGroups,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '그룹명 조회 실패',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':group_name')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'group_name', description: '그룹명', example: 'admin' })
  @ApiOperation({
    summary: '그룹 권한 조회',
    description: '특정 그룹의 권한 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '그룹 권한 조회 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  async getGroupAuthority(
    @Req() req: Request & { user: Record<string, unknown> },
    @Param('group_name') groupName: string,
  ) {
    try {
      const permissions = await this.groupPermissionService.getPermissionsByGroup(groupName);

      return {
        result: true,
        message: `GET /groupauthority/${groupName}::Get AuthorityManage Success`,
        data: permissions,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: '그룹 권한 조회 실패',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '그룹 권한 조회 실패',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
