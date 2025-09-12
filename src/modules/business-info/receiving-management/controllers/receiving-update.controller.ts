import { Controller, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ReceivingUpdateService } from '../services/receiving-update.service';
import { UpdateReceivingDto } from '../dto/update-receiving.dto';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('입고 관리')
@Controller('receiving-management')
@DevAuth()
export class ReceivingUpdateController {
    constructor(
        private readonly receivingUpdateService: ReceivingUpdateService,
    ) {}

    @Put(':id')
    @ApiOperation({ summary: 'ID로 입고 정보 수정', description: 'ID를 통해 특정 입고 정보를 수정합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '입고 정보 ID' })
    @ApiBody({ type: UpdateReceivingDto })
    @ApiResponse({ status: 200, description: '입고 정보가 성공적으로 수정되었습니다.' })
    @ApiResponse({ status: 404, description: '해당하는 입고 정보를 찾을 수 없습니다.' })
    @ApiResponse({ status: 400, description: '잘못된 요청 데이터입니다.' })
    async updateReceiving(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateReceivingDto: UpdateReceivingDto
    ) {
        return await this.receivingUpdateService.updateReceiving(id, updateReceivingDto);
    }

}
