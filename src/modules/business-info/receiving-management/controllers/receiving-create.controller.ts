import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ReceivingCreateService } from '../services/receiving-create.service';
import { CreateReceivingDto } from '../dto/create-receiving.dto';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('입고 관리')
@Controller('receiving-management')
@DevAuth()
export class ReceivingCreateController {
    constructor(
        private readonly receivingCreateService: ReceivingCreateService,
    ) {}

    @Post()
    @ApiOperation({ summary: '입고 정보 등록', description: '새로운 입고 정보를 등록합니다.' })
    @ApiBody({ type: CreateReceivingDto })
    @ApiResponse({ status: 201, description: '입고 정보가 성공적으로 등록되었습니다.' })
    @ApiResponse({ status: 400, description: '잘못된 요청 데이터입니다.' })
    async createReceiving(@Body() createReceivingDto: CreateReceivingDto) {
        return await this.receivingCreateService.createReceiving(createReceivingDto);
    }
}
