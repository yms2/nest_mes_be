import { Controller, Post, Body, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { BomInfoCreateService } from '../services/bom-info-create.service';
import { CreateBomDto } from '../dto/create-bom.dto';
import { BomInfo } from '../entities/bom-info.entity';
import { ApiResponse as CustomApiResponse, ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('BOM 등록/수정/삭제')
@Controller('bom-info')
@Auth()
export class BomInfoCreateController {
  constructor(private readonly bomInfoCreateService: BomInfoCreateService) {}

  @Post()
  @ApiOperation({
    summary: 'BOM 정보 등록',
    description: '새로운 BOM 정보를 등록합니다. 상위품목과 하위품목의 관계를 정의하고 수량과 단위를 설정합니다.',
  })
  @ApiBody({
    type: CreateBomDto,
    description: 'BOM 생성 데이터',
    examples: {
      example1: {
        summary: '기본 BOM 등록',
        description: '완제품과 부품 간의 BOM 관계를 등록합니다.',
        value: {
          parentProductCode: 'PROD001',
          childProductCode: 'PROD002',
          quantity: 5,
          unit: '개'
        } as CreateBomDto
      },
      example2: {
        summary: '재료 BOM 등록',
        description: '제품과 원재료 간의 BOM 관계를 등록합니다.',
        value: {
          parentProductCode: 'PROD003',
          childProductCode: 'MAT001',
          quantity: 2.5,
          unit: 'kg'
        } as CreateBomDto
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'BOM 등록 성공',
    schema: {
      example: {
        success: true,
        message: 'BOM이 성공적으로 등록되었습니다.',
        data: {
          id: 1,
          parentProductCode: 'PROD001',
          childProductCode: 'PROD002',
          quantity: 5,
          unit: '개',
        },
        timestamp: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 데이터',
    schema: {
      example: {
        success: false,
        message: '모든 필드는 필수입니다.',
        data: null,
        timestamp: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '중복된 BOM',
    schema: {
      example: {
        success: false,
        message: '이미 존재하는 BOM입니다: PROD001 → PROD002',
        data: null,
        timestamp: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증되지 않은 요청',
  })
  async createBom(
    @Body() createBomDto: CreateBomDto,
    @Request() req,
  ): Promise<CustomApiResponse<BomInfo>> {
    try {
      const username = req.user?.username || 'unknown';
      const bom = await this.bomInfoCreateService.createBom(createBomDto, username);

      return ApiResponseBuilder.success(
        bom,
        'BOM이 성공적으로 등록되었습니다.'
      );
    } catch (error) {
      return ApiResponseBuilder.error(
        error.message || 'BOM 등록에 실패했습니다.'
      );
    }
  }
}
