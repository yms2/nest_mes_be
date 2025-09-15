import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InventoryLotService } from '../services/inventory-lot.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { CreateLotInventoryDto, DecreaseLotInventoryDto } from '../dto/create-lot-inventory.dto';

@ApiTags('LOT별 재고 관리')
@Controller('inventory/lot')
@DevAuth()
export class InventoryLotController {
    constructor(
        private readonly inventoryLotService: InventoryLotService,
    ) {}

    @Get('all')
    @ApiOperation({ 
        summary: '모든 LOT 재고 조회',
        description: 'LOT별 재고 목록을 조회합니다.'
    })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수 (기본값: 10)' })
    @ApiQuery({ name: 'productCode', required: false, description: '품목 코드' })
    @ApiQuery({ name: 'lotCode', required: false, description: 'LOT 코드' })
    @ApiQuery({ name: 'lotStatus', required: false, description: 'LOT 상태' })
    async getAllLotInventories(@Query() searchParams: any) {
        const result = await this.inventoryLotService.getAllLotInventories(searchParams);
        
        return {
            success: true,
            message: 'LOT 재고 목록을 성공적으로 조회했습니다.',
            data: result,
            timestamp: new Date().toISOString()
        };
    }

    @Get('product/:productCode')
    @ApiOperation({ 
        summary: '품목별 LOT 재고 조회',
        description: '특정 품목의 모든 LOT 재고를 조회합니다.'
    })
    @ApiParam({ name: 'productCode', description: '품목 코드' })
    async getLotInventoriesByProduct(@Param('productCode') productCode: string) {
        const lotInventories = await this.inventoryLotService.getLotInventoriesByProduct(productCode);
        const totalQuantity = await this.inventoryLotService.getTotalQuantityByProduct(productCode);
        
        return {
            success: true,
            message: '품목별 LOT 재고를 성공적으로 조회했습니다.',
            data: {
                productCode,
                lotInventories,
                totalQuantity
            },
            timestamp: new Date().toISOString()
        };
    }

    @Get('product/:productCode/lot/:lotCode')
    @ApiOperation({ 
        summary: '특정 LOT 재고 조회',
        description: '특정 품목의 특정 LOT 재고를 조회합니다.'
    })
    @ApiParam({ name: 'productCode', description: '품목 코드' })
    @ApiParam({ name: 'lotCode', description: 'LOT 코드' })
    async getLotInventory(
        @Param('productCode') productCode: string,
        @Param('lotCode') lotCode: string
    ) {
        const lotInventory = await this.inventoryLotService.getLotInventory(productCode, lotCode);
        
        return {
            success: true,
            message: 'LOT 재고를 성공적으로 조회했습니다.',
            data: lotInventory,
            timestamp: new Date().toISOString()
        };
    }

    @Post('create-or-update')
    @ApiOperation({ 
        summary: 'LOT 재고 생성 또는 수량 증가',
        description: 'LOT별 재고를 생성하거나 기존 LOT의 수량을 증가시킵니다.'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'LOT 재고가 성공적으로 생성/수정되었습니다.',
    })
    async createOrUpdateLotInventory(@Body() createLotDto: CreateLotInventoryDto) {
        const lotInventory = await this.inventoryLotService.createOrUpdateLotInventory(
            createLotDto.productCode,
            createLotDto.lotCode,
            createLotDto.quantity,
            createLotDto.productName,
            createLotDto.unit,
            createLotDto.storageLocation,
            createLotDto.receivingCode,
            createLotDto.username || 'system'
        );
        
        return {
            success: true,
            message: 'LOT 재고가 성공적으로 처리되었습니다.',
            data: lotInventory,
            timestamp: new Date().toISOString()
        };
    }

    @Put('decrease')
    @ApiOperation({ 
        summary: 'LOT 재고 수량 감소',
        description: 'LOT별 재고 수량을 감소시킵니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'LOT 재고 수량이 성공적으로 감소되었습니다.',
    })
    async decreaseLotInventory(@Body() decreaseLotDto: DecreaseLotInventoryDto) {
        const lotInventory = await this.inventoryLotService.decreaseLotInventory(
            decreaseLotDto.productCode,
            decreaseLotDto.lotCode,
            decreaseLotDto.quantity,
            decreaseLotDto.username || 'system'
        );
        
        return {
            success: true,
            message: 'LOT 재고 수량이 성공적으로 감소되었습니다.',
            data: lotInventory,
            timestamp: new Date().toISOString()
        };
    }
}
