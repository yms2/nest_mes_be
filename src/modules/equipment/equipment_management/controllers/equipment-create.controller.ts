import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EquipmentCreateService } from '../services/equipment-create.service';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { Equipment } from '../entities/equipment.entity';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('설비 관리')
@Controller('equipment')
export class EquipmentCreateController {
  constructor(
    private readonly equipmentCreateService: EquipmentCreateService,
  ) {}

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '설비 등록',
    description: '새로운 설비를 등록합니다. 설비 코드를 입력하지 않으면 자동으로 생성됩니다.',
  })
  @ApiBody({
    type: CreateEquipmentDto,
    description: '설비 등록 정보 (설비 코드는 선택사항, 자동 생성됨)',
    examples: {
      example: {
        summary: '설비 코드 자동 생성 예시',
        value: {
          equipmentName: 'CNC 머신',
          equipmentModel: 'XK-2000',
          equipmentPurchasePlace: 'ABC 기계',
          equipmentPurchaseDate: '2024-01-15',
          equipmentPurchasePrice: 50000000,
          equipmentHistory: '2024년 신규 구매, 정밀 가공용',
          equipmentWorker: '김철수',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '설비 등록 성공',
    type: Equipment,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터 (필수 필드 누락)',
  })
  @ApiResponse({
    status: 409,
    description: '중복된 설비 코드',
  })
  async createEquipment(@Body() createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    return this.equipmentCreateService.createEquipment(createEquipmentDto);
  }
}
