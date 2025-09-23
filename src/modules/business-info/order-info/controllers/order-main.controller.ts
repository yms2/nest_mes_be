import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { OrderMainService } from '../services/order-main.service';
import { CreateOrderMainDto } from '../dto/create-order-main.dto';
import { UpdateOrderMainDto } from '../dto/update-order-main.dto';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('수주 메인 관리(발주)')
@Controller('order-main')
@DevAuth()
export class OrderMainController {
    constructor(private readonly orderMainService: OrderMainService) {}

    @Post()
    @ApiOperation({ summary: '수주 메인 정보 등록', description: '새로운 수주 메인 정보를 등록합니다.' })
    @ApiBody({ type: CreateOrderMainDto })
    @ApiResponse({ status: 201, description: '수주 메인 정보가 성공적으로 등록되었습니다.' })
    @ApiResponse({ status: 400, description: '잘못된 요청 데이터입니다.' })
    @ApiResponse({ status: 409, description: '중복된 수주 코드입니다.' })
    async createOrderMain(@Body() createOrderMainDto: CreateOrderMainDto) {
        return await this.orderMainService.createOrderMain(createOrderMainDto);
    }

    @Post('individual-order')
    @ApiOperation({ summary: '개별 발주 생성', description: '개별 발주 정보를 직접 입력하여 발주를 생성합니다.' })
    @ApiBody({ type: CreateOrderMainDto })
    @ApiResponse({ status: 201, description: '개별 발주가 성공적으로 생성되었습니다.' })
    @ApiResponse({ status: 400, description: '잘못된 요청 데이터입니다.' })
    @ApiResponse({ status: 409, description: '중복된 수주 코드입니다.' })
    async createIndividualOrder(@Body() createOrderMainDto: CreateOrderMainDto) {
        return await this.orderMainService.createIndividualOrder(createOrderMainDto);
    }


    
    @Get()
    @ApiOperation({ summary: '수주 메인 정보 목록 조회 (디테일 포함)', description: '모든 수주 메인 정보와 관련된 발주 디테일 정보를 함께 조회합니다.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수 (기본값: 10)' })
    @ApiQuery({ name: 'search', required: false, type: String, description: '검색 키워드 (수주코드, 비고, 승인정보)' })
    @ApiResponse({ status: 200, description: '수주 메인 정보 목록과 발주 디테일 정보를 성공적으로 조회했습니다.' })
    @ApiResponse({ status: 400, description: '잘못된 요청 파라미터입니다.' })
    async getAllOrderMains(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string
    ) {
        return await this.orderMainService.getAllOrderMains(page, limit, search);
    }

    @Put(':id')
    @ApiOperation({ summary: '수주 메인 정보 수정', description: '특정 수주 메인 정보를 수정합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '수주 메인 정보 ID' })
    @ApiBody({ type: UpdateOrderMainDto })
    @ApiResponse({ status: 200, description: '수주 메인 정보가 성공적으로 수정되었습니다.' })
    @ApiResponse({ status: 404, description: '해당하는 수주 메인 정보를 찾을 수 없습니다.' })
    @ApiResponse({ status: 400, description: '잘못된 요청 데이터입니다.' })
    @ApiResponse({ status: 409, description: '중복된 수주 코드입니다.' })
    async updateOrderMain(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateOrderMainDto: UpdateOrderMainDto
    ) {
        return await this.orderMainService.updateOrderMain(id, updateOrderMainDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'ID로 수주 메인 정보 삭제', description: 'ID를 통해 특정 수주 메인 정보를 삭제합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '수주 메인 정보 ID' })
    @ApiResponse({ status: 200, description: '수주 메인 정보가 성공적으로 삭제되었습니다.' })
    @ApiResponse({ status: 404, description: '해당하는 수주 메인 정보를 찾을 수 없습니다.' })
    @ApiResponse({ status: 400, description: '잘못된 요청 파라미터입니다.' })
    async deleteOrderMain(@Param('id', ParseIntPipe) id: number) {
        return await this.orderMainService.deleteOrderMain(id);
    }
}