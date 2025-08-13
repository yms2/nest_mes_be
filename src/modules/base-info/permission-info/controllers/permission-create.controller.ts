import { Controller, Post, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PermissionCreateService } from '../services/permission-create.service';
import { PermissionCreateDto } from '../dto/permission-create.dto';
import { AuthorityManages } from '../entities/permission.entity';
import { ApiResponse as ApiResponseInterface } from 'src/common/interfaces/api-response.interface';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('권한관리')
@Controller('permissions')
export class PermissionCreateController {
    constructor(
        private readonly permissionCreateService: PermissionCreateService,
    ) {}

    @Post()
    @Auth()
    @ApiOperation({ 
        summary: '권한 정보 등록', 
        description: '새로운 권한 정보를 등록합니다.' 
    })
    @ApiBody({ type: PermissionCreateDto })
    @ApiResponse({ 
        status: 201, 
        description: '권한 등록 성공',
        schema: { $ref: '#/components/schemas/AuthorityManages' }
    })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 409, description: '이미 존재하는 권한 그룹명' })
    async createPermission(
        @Body() createDto: PermissionCreateDto,
        @Request() req: any,
    ): Promise<ApiResponseInterface<AuthorityManages>> {
        const result = await this.permissionCreateService.createPermission(createDto);

        return {
            success: true,
            message: '권한 정보가 성공적으로 등록되었습니다.',
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
}
