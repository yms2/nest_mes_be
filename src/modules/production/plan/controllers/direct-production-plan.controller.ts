import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { DirectProductionPlanCreateService } from '../services/direct-production-plan-create.service';
import { ProductionPlanReadService } from '../services/production-plan-read.service';
import { CreateDirectProductionPlanDto } from '../dto/create-direct-production-plan.dto';
import { QueryProductionPlanDto } from '../dto/query-production-plan.dto';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('직접 생산 계획')
@Controller('direct-production-plan')
@DevAuth()
export class DirectProductionPlanController {
  constructor(
    private readonly directProductionPlanCreateService: DirectProductionPlanCreateService,
    private readonly productionPlanReadService: ProductionPlanReadService,
  ) {}

  @Post()
  @ApiOperation({
    summary: '직접 생산 계획 생성',
    description: '수주와 관계없이 직접 생산 계획을 생성합니다.',
  })
  @ApiResponse({ status: 201, description: '직접 생산 계획이 성공적으로 생성되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 404, description: '품목을 찾을 수 없습니다.' })
  async createDirectProductionPlan(
    @Body(ValidationPipe) dto: CreateDirectProductionPlanDto,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      const productionPlan = await this.directProductionPlanCreateService.createDirectProductionPlan(
        dto,
        req.user.username,
      );

      return ApiResponseBuilder.success(
        productionPlan,
        '직접 생산 계획이 성공적으로 생성되었습니다.',
      );
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }

  @Get()
  @ApiOperation({
    summary: '직접 생산 계획 목록 조회',
    description: '직접 생성된 생산 계획 목록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '직접 생산 계획 목록을 성공적으로 조회했습니다.' })
  async getDirectProductionPlans(
    @Query(ValidationPipe) query: QueryProductionPlanDto,
  ) {
    try {
      const result = await this.productionPlanReadService.getAllProductionPlan(query.page || 1, query.limit || 20, query);

      return ApiResponseBuilder.success(result, '직접 생산 계획 목록을 성공적으로 조회했습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }
}
