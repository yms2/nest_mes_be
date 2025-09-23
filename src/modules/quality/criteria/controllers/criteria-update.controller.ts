import { QualityCriteriaUpdateService } from "../services/quality-criteria-update.service";
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiParam } from "@nestjs/swagger";
import { UpdateCriteriaDto } from "../dto/criteria-update.dto";
import { Body, Controller, Delete, Put, Req, Param } from "@nestjs/common";
import { DevAuth } from "@/common/decorators/dev-auth.decorator";

@DevAuth()
@ApiTags('품질기준정보')
@Controller('quality-criteria')
export class CriteriaUpdateController {
    constructor(
        private readonly qualityCriteriaUpdateService: QualityCriteriaUpdateService,
    ) {}

    @Put('update/:id')
    @ApiOperation({ summary: '품질기준정보 수정' })
    @ApiParam({ name: 'id', description: '품질기준 ID' })
    @ApiBody({ type: UpdateCriteriaDto })
    @ApiResponse({ status: 201, description: '품질기준정보 수정 성공' })
    @ApiResponse({ status: 400, description: '품질기준정보 수정 실패' })
    async updateQualityCriteria(
        @Param('id') id: string,
        @Body() updateCriteriaDto: UpdateCriteriaDto,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.qualityCriteriaUpdateService.updateQualityCriteria(id, updateCriteriaDto, username);
    }

    @Delete('delete/:id')
    @ApiOperation({ summary: '품질기준정보 삭제' })
    @ApiParam({ name: 'id', description: '품질기준 ID' })
    @ApiResponse({ status: 201, description: '품질기준정보 삭제 성공' })
    @ApiResponse({ status: 400, description: '품질기준정보 삭제 실패' })
    async deleteQualityCriteria(
        @Param('id') id: string,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.qualityCriteriaUpdateService.deleteQualityCriteria(id, username);
    }
}
