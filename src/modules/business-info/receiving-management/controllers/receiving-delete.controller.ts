import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReceivingDeleteService } from '../services/receiving-delete.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('입고 관리')
@Controller('receiving-management')
@DevAuth()
export class ReceivingDeleteController {
    constructor(
        private readonly receivingDeleteService: ReceivingDeleteService,
    ) {}

    @Delete(':id')
    @ApiOperation({ summary: 'ID로 입고 정보 삭제', description: 'ID를 통해 특정 입고 정보를 삭제합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '입고 정보 ID' })
    @ApiResponse({ status: 200, description: '입고 정보가 성공적으로 삭제되었습니다.' })
    @ApiResponse({ status: 404, description: '해당하는 입고 정보를 찾을 수 없습니다.' })
    @ApiResponse({ status: 400, description: '잘못된 요청 파라미터입니다.' })
    async deleteReceiving(@Param('id', ParseIntPipe) id: number) {
        return await this.receivingDeleteService.deleteReceiving(id);
    }
}
