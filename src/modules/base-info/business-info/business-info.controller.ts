import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BusinessInfoCreateService } from './services/business-info-create.service';
import { CreateBusinessInfoDto } from './dto/create-business-info.dto';

@ApiTags('BusinessInfo')
@Controller('business-info')
export class BusinessInfoController {
  constructor(private readonly businessInfoCreateService: BusinessInfoCreateService) {}

  @Post('')
  @ApiOperation({ summary: '사업장 정보 생성', description: '신규 사업장 정보를 생성합니다.' })
  async createBusinessInfo(@Body() createBusinessInfoDto: CreateBusinessInfoDto) {
    const result = await this.businessInfoCreateService.createBusinessInfo(createBusinessInfoDto);
    return {
      message: '사업장 정보 등록되었습니다.',
      data: result,
    };
  }
}
