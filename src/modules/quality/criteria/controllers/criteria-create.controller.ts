import { Body, Controller, Post, Req } from "@nestjs/common";
import { QualityCriteriaCreateService } from "../services/quality-criteria-create.service";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateCriteriaDto } from "../dto/criteria.dto";
import { DevAuth } from "@/common/decorators/dev-auth.decorator";


@DevAuth()
@ApiTags('품질기준정보')
@Controller('quality-criteria')
export class CriteriaCreateController {

    constructor(
        private readonly qualityCriteriaCreateService: QualityCriteriaCreateService,
    ) {}

    @Post('create')
    @ApiOperation({ summary: '품질기준정보 등록' })
    @ApiBody({ type: CreateCriteriaDto })
    @ApiResponse({ status: 201, description: '품질기준정보 등록 성공' })
    @ApiResponse({ status: 400, description: '품질기준정보 등록 실패' })
    async createQualityCriteria(
        @Body() createCriteriaDto: CreateCriteriaDto,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.qualityCriteriaCreateService.createQualityCriteria(createCriteriaDto, username);
    }
}