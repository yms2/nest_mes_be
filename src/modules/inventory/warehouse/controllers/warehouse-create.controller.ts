import { Controller, Post, Body, Req, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { logService } from 'src/modules/log/Services/log.service';
import { WarehouseCreateService } from '../services/warehouse-create.service';

import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { CreateWarehouseDto } from '../dto/warehouse-create.dto';
import { Warehouse } from '../entities/warehouse.entity';
import { DevWarehouseAuth } from '@/common/decorators/dev-menu-permissions.decorator';

@ApiTags('창고관리')
@Controller('warehouse')

export class WarehouseCreateController {
    constructor(
        private readonly warehouseCreateService: WarehouseCreateService,
        private readonly logService: logService,
    ) {}

    @Post()
    @DevWarehouseAuth.create()
    @ApiOperation({ summary: '창고 생성', description: '신규 창고를 생성합니다.' })
    async createWarehouse(@Body() createWarehouseDto: CreateWarehouseDto, @Req() req: Request & { user: { username: string } }) {
        try {
            const result = await this.warehouseCreateService.createWarehouse(createWarehouseDto, req.user.username);
            
            await this.writeCreateLog(result, req.user.username);

            return ApiResponseBuilder.success(result, '창고가 생성되었습니다.');
        } catch (error) {
            await this.writeCreateFailLog(createWarehouseDto, req.user.username, error);
            throw error;
        }
    }

    async checkWarehouseCodeDuplicate(@Param('warehouseCode') warehouseCode: string) {
        try {
            const isDuplicate = await this.warehouseCreateService.checkWarehouseCodeDuplicate(warehouseCode);
            return {
                warehouseCode,
                isDuplicate,
                message: isDuplicate ? '이미 사용중인 창고 코드입니다.' : '사용 가능한 창고 코드입니다.',
            };
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,   
                    message: '창고 코드 중복 확인 중 오류가 발생했습니다.',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async writeCreateLog(result: Warehouse, username: string) {
        await this.logService.createDetailedLog({
            moduleName: '창고관리',
            action: 'CREATE',
            username,
            targetId: result.warehouseCode,
            targetName: result.warehouseName,
        });
    }

    private async writeCreateFailLog(dto: CreateWarehouseDto, username: string, error: Error) {
        await this.logService.createDetailedLog({
            moduleName: '창고관리',
            action: 'CREATE_FAIL',
            username,
            targetId: dto.warehouseName,
            targetName: dto.warehouseName,
        });
    }
}