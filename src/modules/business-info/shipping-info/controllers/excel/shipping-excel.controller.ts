import { Controller, Get, Res } from "@nestjs/common";
import { ShippingTemplateService } from "../../services/shipping-template.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import { DevAuth } from "@/common/decorators/dev-auth.decorator";

@DevAuth()
@ApiTags('출하관리 엑셀')
@Controller('shipping-info')
export class ShippingExcelController {
    constructor(
        private readonly shippingTemplateService: ShippingTemplateService
    ) {}

    @Get('/excel/download-template')
    @ApiOperation({ summary: '출하관리 엑셀 템플릿 다운로드' })
    async downloadTemplate(@Res() res: Response) {
        const buffer = await this.shippingTemplateService.generateUploadTemplate();
        const fileName = encodeURIComponent('출하관리 양식.xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(buffer);
    }
}