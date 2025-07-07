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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GroupPermissionService } from './GroupPermission.service';

@ApiTags('GroupPermission')
@Controller('groupauthority')
export class GroupPermissionController {
  constructor(private readonly groupPermissionService: GroupPermissionService) {}

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
    schema: {
      type: 'object',
      properties: {
        result: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'GET /groupauthority/admin::Get AuthorityManage Success',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 30 },
            all_grant: { type: 'string', example: 'allow' },
            group_name: { type: 'string', example: 'admin' },
            main_menu: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      menu_id: { type: 'string', example: 'M001' },
                      menu_name: { type: 'string', example: '기준정보' },
                      view: { type: 'string', example: 't' },
                      key: { type: 'string', example: 'referenceInfo' },
                    },
                  },
                },
              },
            },
            sub_menu: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      upper_menu_id: { type: 'string', example: 'M001' },
                      upper_menu_name: { type: 'string', example: '기준정보' },
                      menu_id: { type: 'string', example: 'S001' },
                      menu_name: { type: 'string', example: '사업장정보' },
                      create: { type: 'string', example: 't' },
                      read: { type: 'string', example: 't' },
                      update: { type: 'string', example: 't' },
                      delete: { type: 'string', example: 't' },
                      rowCount: { type: 'number', example: 9 },
                      key: { type: 'string', example: 'businessInfo' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '토큰이 제공되지 않았습니다.' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 },
      },
    },
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
 