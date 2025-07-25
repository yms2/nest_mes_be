import { Controller, Get, Res } from "@nestjs/common";
import { ExcelTemplateService } from '../services/business-template.service'
import { Response } from 'express';
@Controller('business-info')
export class ExcelTemplateController {
  constructor(private readonly excelTemplateService: ExcelTemplateService) {}

  @Get('download-template')
  async downloadTemplate(@Res() res: Response){
    const buffer = await this.excelTemplateService.generateUploadTemplate();
  const fileName = encodeURIComponent('사업장정보 양식.xlsx');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`,);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.end(buffer);
  }
}