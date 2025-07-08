import { Body, Post,Controller } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { NotEmptyStringPipe } from "src/common/pipes/not-empty-string.pipe";
import { CreateBusinessInfoDto } from "../dto/create-business-info.dto";
import { ApiResponseBuilder } from "src/common/interfaces/api-response.interface";
import { BusinessInfoCreateService } from "../services/business-info-create.service";
import { logService } from "src/modules/log/Services/log.service";


@ApiTags("BusinessInfo")
@Controller('business-info')
export class BusinessInfoCreateController {
  constructor(
    private readonly businessInfoCreateService: BusinessInfoCreateService,
    private readonly logService: logService, 
  ) {}


  @Post('')
  @ApiOperation({ summary: '사업장 정보 생성', description: '신규 사업장 정보를 생성합니다.' })
  async createBusinessInfo(
    @Body('businessNumber', NotEmptyStringPipe) bodyBusinessNumber: string,
    @Body('businessName', NotEmptyStringPipe) bodyBusinessName: string,
    @Body('businessCeo', NotEmptyStringPipe) bodyBusinessCeo: string,
    @Body() createBusinessInfoDto: CreateBusinessInfoDto,
  ) {
    try {
      const result = await this.businessInfoCreateService.createBusinessInfo(createBusinessInfoDto);

      // 상세 로그 생성
      await this.logService.createBusinessLog({
        action: 'CREATE',
        username: 'system',
        businessNumber: result.businessNumber,
        businessName: result.businessName,
        details: '새로운 사업장 정보 생성',
      });

      return ApiResponseBuilder.success(result, '사업장 정보 등록되었습니다.');
    } catch (error) {
      // 에러 로그 생성
      await this.logService
        .createBusinessLog({
          action: 'CREATE_FAIL',
          username: 'system',
          businessNumber: createBusinessInfoDto.businessNumber,
          businessName: createBusinessInfoDto.businessName,
          details: `생성 실패: ${(error as Error).message}`,
        })
        .catch(() => {});

      throw error;
    }
  }
}