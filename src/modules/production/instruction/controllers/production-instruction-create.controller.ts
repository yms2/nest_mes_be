import {
  Controller,
  Post,
  Body,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { ProductionInstructionService } from '../services/production-instruction-create.service';
import { 
  CreateProductionInstructionDto, 
} from '../dto/create-production-instruction.dto';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('생산 지시')
@Controller('production-instruction')
@DevAuth()
export class ProductionInstructionController {
  constructor(
    private readonly productionInstructionService: ProductionInstructionService,
  ) {}

  @Post()
  @ApiOperation({
    summary: '생산 지시 생성',
    description: '새로운 생산 지시를 생성합니다.',
  })
  @ApiResponse({ status: 201, description: '생산 지시가 성공적으로 생성되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 404, description: '생산 계획을 찾을 수 없습니다.' })
  async createProductionInstruction(
    @Body(ValidationPipe) dto: CreateProductionInstructionDto,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      const productionInstruction = await this.productionInstructionService.createProductionInstruction(
        dto,
        req.user.username,
      );

      return ApiResponseBuilder.success(
        productionInstruction,
        '생산 지시가 성공적으로 생성되었습니다.',
      );
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }
}
