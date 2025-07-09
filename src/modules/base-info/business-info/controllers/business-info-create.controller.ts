import { Body, Post,Controller, UseGuards, Req } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { NotEmptyStringPipe } from "src/common/pipes/not-empty-string.pipe";
import { CreateBusinessInfoDto } from "../dto/create-business-info.dto";
import { ApiResponseBuilder } from "src/common/interfaces/api-response.interface";
import { BusinessInfoCreateService } from "../services";
import { logService } from "src/modules/log/Services/log.service";
import { Auth } from "src/common/decorators/auth.decorator";
import { BusinessInfo } from "../entities/business-info.entity";


@ApiTags("BusinessInfo")
@Controller('business-info')
export class BusinessInfoCreateController {
  constructor(
    private readonly businessInfoCreateService: BusinessInfoCreateService,
    private readonly logService: logService, 
  ) {}


  @Post()
  @Auth()
  @ApiOperation({ summary: '사업장 정보 생성', description: '신규 사업장 정보를 생성합니다.' })
  async createBusinessInfo(
    @Body() createBusinessInfoDto: CreateBusinessInfoDto,
    @Req() req: Request & { user: { username: string } },  // 추가
  ) {
    try {
      const result = await this.businessInfoCreateService.createBusinessInfo(
        createBusinessInfoDto,
        req.user.username,
      );

        await this.writeCreateLog(result, req.user.username);

        return ApiResponseBuilder.success(result, '거래처 정보 등록되었습니다.');

    } catch (error) {

      await this.writeCreateFailLog(createBusinessInfoDto, req.user.username, error);
      throw error;
    }
  }

    private async writeCreateLog(result: BusinessInfo, username: string) {
      await this.logService.createDetailedLog({
        moduleName: '사업장관리',
        action: 'CREATE',
        username,
        targetId: result.businessNumber,
        targetName: result.businessName,
        details: '새로운 사업장 정보 생성',
      });
    }

    private async writeCreateFailLog(dto: CreateBusinessInfoDto, username: string, error: Error) {
      await this.logService.createDetailedLog({
        moduleName: '거래처관리',
        action: 'CREATE_FAIL',
        username,
        targetId: dto.businessNumber,
        targetName: dto.businessName,
        details: `생성 실패: ${error.message}`,
      }).catch(() => {});
    }
}