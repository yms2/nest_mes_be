import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { ProductionPlanCreateService } from '../services/production-plan-create.service';
import { ProductionPlanReadService } from '../services/production-plan-read.service';
import { BomExplosionService } from '../services/bom-explosion.service';
import { CreateProductionPlanDto, UpdateProductionPlanDto } from '../dto/create-production-plan.dto';
import { QueryProductionPlanDto } from '../dto/query-production-plan.dto';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('생산 계획')
@Controller('production-plan')
@DevAuth()
export class ProductionPlanController {
  constructor(
    private readonly productionPlanCreateService: ProductionPlanCreateService,
    private readonly productionPlanReadService: ProductionPlanReadService,
    private readonly bomExplosionService: BomExplosionService,
  ) {}

  @Post()
  @ApiOperation({
    summary: '생산 계획 생성',
    description: '수주 코드를 기반으로 BOM을 전개하고, 선택된 품목들로 생산 계획을 생성합니다.',
  })
  @ApiResponse({ status: 201, description: '생산 계획이 성공적으로 생성되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 404, description: '수주를 찾을 수 없습니다.' })
  async createProductionPlan(
    @Body(ValidationPipe) dto: CreateProductionPlanDto,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      const productionPlans = await this.productionPlanCreateService.createProductionPlanFromOrder(
        {
          ...dto,
          productionPlanDate: new Date(dto.productionPlanDate),
          expectedStartDate: new Date(dto.expectedStartDate),
          expectedCompletionDate: new Date(dto.expectedCompletionDate),
        },
        req.user.username,
      );

      return ApiResponseBuilder.success(
        productionPlans,
        `${productionPlans.length}개의 생산 계획이 성공적으로 생성되었습니다.`,
      );
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }

  @Get()
  @ApiOperation({
    summary: '생산 계획 목록 조회',
    description: '조건에 따라 생산 계획 목록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '생산 계획 목록을 성공적으로 조회했습니다.' })
  async getProductionPlans(@Query(ValidationPipe) query: QueryProductionPlanDto) {
    try {
      const result = await this.productionPlanReadService.getProductionPlans(query);

      return ApiResponseBuilder.success(result, '생산 계획 목록을 성공적으로 조회했습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: '생산 계획 수정',
    description: '생산 계획 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '생산 계획 ID', example: 1 })
  @ApiResponse({ status: 200, description: '생산 계획이 성공적으로 수정되었습니다.' })
  @ApiResponse({ status: 404, description: '생산 계획을 찾을 수 없습니다.' })
  async updateProductionPlan(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateProductionPlanDto,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      const productionPlan = await this.productionPlanCreateService.updateProductionPlan(
        id,
        {
          ...dto,
          productionPlanDate: dto.productionPlanDate ? new Date(dto.productionPlanDate) : undefined,
          expectedStartDate: dto.expectedStartDate ? new Date(dto.expectedStartDate) : undefined,
          expectedCompletionDate: dto.expectedCompletionDate ? new Date(dto.expectedCompletionDate) : undefined,
        },
        req.user.username,
      );

      return ApiResponseBuilder.success(productionPlan, '생산 계획이 성공적으로 수정되었습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: '생산 계획 삭제',
    description: '생산 계획을 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '생산 계획 ID', example: 1 })
  @ApiResponse({ status: 200, description: '생산 계획이 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '생산 계획을 찾을 수 없습니다.' })
  async deleteProductionPlan(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      await this.productionPlanCreateService.deleteProductionPlan(id, req.user.username);
      return ApiResponseBuilder.success(null, '생산 계획이 성공적으로 삭제되었습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }
}
