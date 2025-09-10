import { Controller, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PermissionDeleteService } from '../services/permission-delete.service';
import { PermissionDeleteDto, BatchPermissionDeleteDto } from '../dto/permission-delete.dto';
import { ApiResponse as ApiResponseInterface } from 'src/common/interfaces/api-response.interface';
import { DevAuthorityManageAuth } from '@/common/decorators/dev-menu-permissions.decorator';

@ApiTags('권한관리')
@Controller('permissions')
export class PermissionDeleteController {
    constructor(
        private readonly permissionDeleteService: PermissionDeleteService,
    ) {}

    @Delete(':id')
    @DevAuthorityManageAuth.delete()
    @ApiOperation({ summary: '권한 정보 삭제' })
    @ApiParam({ name: 'id', description: '권한 ID' })
    @ApiResponse({ status: 200, description: '권한 삭제 성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 403, description: '삭제 권한 없음' })
    @ApiResponse({ status: 404, description: '권한 정보를 찾을 수 없음' })
    async deletePermission(
        @Param('id') id: number,
        @Body() deleteDto: PermissionDeleteDto,
        @Request() req: any,
    ): Promise<ApiResponseInterface<void>> {
        await this.permissionDeleteService.deletePermission(
            id,
            deleteDto.deleteReason,
            req.user?.username || 'unknown',
        );

        return {
            success: true,
            message: '권한 정보가 성공적으로 삭제되었습니다.',
            data: undefined,
            timestamp: new Date().toISOString(),
        };
    }

}
