import { Controller, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PermissionUpdateService } from '../services/permission-update.service';
import { PermissionUpdateDto } from '../dto/permission-update.dto';
import { authoritymanages } from '../entities/permission.entity';
import { ApiResponse as ApiResponseInterface } from 'src/common/interfaces/api-response.interface';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('권한관리')
@Controller('permissions')
export class PermissionUpdateController {
    constructor(
        private readonly permissionUpdateService: PermissionUpdateService,
    ) {}

    @Put(':id')
    @Auth()
    @ApiOperation({ summary: '권한 정보 업데이트' })
    @ApiParam({ name: 'id', description: '권한 ID' })
    @ApiResponse({ status: 200, description: '권한 업데이트 성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 404, description: '권한 정보를 찾을 수 없음' })
    async updatePermission(
        @Param('id') id: number,
        @Body() updateDto: PermissionUpdateDto,
        @Request() req: any,
    ): Promise<ApiResponseInterface<authoritymanages>> {
        const result = await this.permissionUpdateService.updatePermission(
            id,
            updateDto,
            req.user?.username || 'unknown',
        );

        return {
            success: true,
            message: '권한 정보가 성공적으로 업데이트되었습니다.',
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
}
