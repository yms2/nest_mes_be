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
import { DirectProductionPlanCreateService } from '../services/direct-production-plan-create.service';
import { ProductionPlanReadService } from '../services/production-plan-read.service';
import { ProductionPlanCreateService } from '../services/production-plan-create.service';
import { CreateDirectProductionPlanDto, UpdateDirectProductionPlanDto } from '../dto/create-direct-production-plan.dto';
import { UpdateProductionPlanDto } from '../dto/create-production-plan.dto';
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
    private readonly productionPlanCreateService: ProductionPlanCreateService,
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
      const result = await this.productionPlanReadService.getProductionPlans(query);

      return ApiResponseBuilder.success(result, '직접 생산 계획 목록을 성공적으로 조회했습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }

//   @Get('product/:productCode')
//   @ApiOperation({
//     summary: '품목별 직접 생산 계획 조회',
//     description: '특정 품목의 직접 생산 계획을 조회합니다.',
//   })
//   @ApiParam({ name: 'productCode', description: '품목 코드', example: 'PRD001' })
//   @ApiResponse({ status: 200, description: '품목별 직접 생산 계획을 성공적으로 조회했습니다.' })
//   async getDirectProductionPlansByProduct(@Param('productCode') productCode: string) {
//     try {
//       const productionPlans = await this.directProductionPlanCreateService.getDirectProductionPlansByProduct(productCode);
//       return ApiResponseBuilder.success(productionPlans, '품목별 직접 생산 계획을 성공적으로 조회했습니다.');
//     } catch (error) {
//       return ApiResponseBuilder.error(error.message);
//     }
//   }

//   @Get(':id')
//   @ApiOperation({
//     summary: '직접 생산 계획 상세 조회',
//     description: '특정 직접 생산 계획의 상세 정보를 조회합니다.',
//   })
//   @ApiParam({ name: 'id', description: '생산 계획 ID', example: 1 })
//   @ApiResponse({ status: 200, description: '직접 생산 계획 상세 정보를 성공적으로 조회했습니다.' })
//   @ApiResponse({ status: 404, description: '생산 계획을 찾을 수 없습니다.' })
//   async getDirectProductionPlanById(@Param('id', ParseIntPipe) id: number) {
//     try {
//       const productionPlan = await this.directProductionPlanCreateService.getDirectProductionPlanById(id);
//       return ApiResponseBuilder.success(productionPlan, '직접 생산 계획 상세 정보를 성공적으로 조회했습니다.');
//     } catch (error) {
//       return ApiResponseBuilder.error(error.message);
//     }
//   }

//   @Put(':id')
//   @ApiOperation({
//     summary: '직접 생산 계획 수정',
//     description: '직접 생산 계획 정보를 수정합니다.',
//   })
//   @ApiParam({ name: 'id', description: '생산 계획 ID', example: 1 })
//   @ApiResponse({ status: 200, description: '직접 생산 계획이 성공적으로 수정되었습니다.' })
//   @ApiResponse({ status: 404, description: '생산 계획을 찾을 수 없습니다.' })
//   async updateDirectProductionPlan(
//     @Param('id', ParseIntPipe) id: number,
//     @Body(ValidationPipe) dto: UpdateDirectProductionPlanDto,
//     @Req() req: Request & { user: { username: string } },
//   ) {
//     try {
//       // 직접 생산계획 수정 (공통 로직 사용)
//       const productionPlan = await this.directProductionPlanCreateService.updateDirectProductionPlan(
//         id,
//         dto,
//         req.user.username,
//       );

//       return ApiResponseBuilder.success(productionPlan, '직접 생산 계획이 성공적으로 수정되었습니다.');
//     } catch (error) {
//       return ApiResponseBuilder.error(error.message);
//     }
//   }

//   @Delete(':id')
//   @ApiOperation({
//     summary: '직접 생산 계획 삭제',
//     description: '직접 생산 계획을 삭제합니다.',
//   })
//   @ApiParam({ name: 'id', description: '생산 계획 ID', example: 1 })
//   @ApiResponse({ status: 200, description: '직접 생산 계획이 성공적으로 삭제되었습니다.' })
//   @ApiResponse({ status: 404, description: '생산 계획을 찾을 수 없습니다.' })
//   async deleteDirectProductionPlan(
//     @Param('id', ParseIntPipe) id: number,
//     @Req() req: Request & { user: { username: string } },
//   ) {
//     try {
//       // 수주 기반과 동일한 삭제 로직 사용 (공통 서비스)
//       await this.productionPlanCreateService.deleteProductionPlan(id, req.user.username);
//       return ApiResponseBuilder.success(null, '직접 생산 계획이 성공적으로 삭제되었습니다.');
//     } catch (error) {
//       return ApiResponseBuilder.error(error.message);
//     }
//   }
}
