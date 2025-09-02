import { Body, Controller, Post, Req, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { logService } from 'src/modules/log/Services/log.service';
import { ProductInfoCreateService } from '../services/product-info-create.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CreateProductInfoDto } from '../dto/product-info-create.dto';
import { ProductInfo } from '../entities/product-info.entity';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('ProductInfo')
@Controller('product-info')
export class ProductInfoCreateController {
  constructor(
    private readonly ProductInfoCreateService: ProductInfoCreateService,
    private readonly logService: logService,
  ) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: '품목 정보 생성', description: '신규 품목 정보를 생성합니다.' })
  async createProductInfo(
    @Body() createProductInfoDto: CreateProductInfoDto,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      const result = await this.ProductInfoCreateService.createProductInfo(
        createProductInfoDto,
        req.user.username,
      );

      await this.writeCreateLog(result, req.user.username);

      return ApiResponseBuilder.success(result, '품목 정보 등록되었습니다.');
    } catch (error) {
      await this.writeCreateFailLog(createProductInfoDto, req.user.username, error);
      throw error;
    }
  }

  @Get('barcode/:productCode')
  @Auth()
  @ApiOperation({ summary: '바코드 이미지 조회', description: '품목 코드로 바코드 이미지를 조회합니다.' })
  @ApiParam({ name: 'productCode', description: '품목 코드', example: 'PRD001' })
  async getBarcodeImage(
    @Param('productCode') productCode: string,
    @Res() res: Response,
  ) {
    try {
      // 품목 정보 조회
      const product = await this.ProductInfoCreateService.findProductByCode(productCode);
      
      if (!product || !product.barcodeImagePath) {
        throw new NotFoundException('바코드 이미지를 찾을 수 없습니다.');
      }

      // 이미지 파일 경로
      const imagePath = path.join(process.cwd(), product.barcodeImagePath);
      
      // 파일 존재 여부 확인
      if (!fs.existsSync(imagePath)) {
        throw new NotFoundException('바코드 이미지 파일을 찾을 수 없습니다.');
      }

      // 이미지 파일 스트림으로 전송
      const stream = fs.createReadStream(imagePath);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="barcode_${productCode}.png"`);
      
      stream.pipe(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('바코드 이미지 조회 중 오류가 발생했습니다.');
    }
  }

  @Get('barcode/download/:productCode')
  @Auth()
  @ApiOperation({ summary: '바코드 이미지 다운로드', description: '품목 코드로 바코드 이미지를 다운로드합니다.' })
  @ApiParam({ name: 'productCode', description: '품목 코드', example: 'PRD001' })
  async downloadBarcodeImage(
    @Param('productCode') productCode: string,
    @Res() res: Response,
  ) {
    try {
      // 품목 정보 조회
      const product = await this.ProductInfoCreateService.findProductByCode(productCode);
      
      if (!product || !product.barcodeImagePath) {
        throw new NotFoundException('바코드 이미지를 찾을 수 없습니다.');
      }

      // 이미지 파일 경로
      const imagePath = path.join(process.cwd(), product.barcodeImagePath);
      
      // 파일 존재 여부 확인
      if (!fs.existsSync(imagePath)) {
        throw new NotFoundException('바코드 이미지 파일을 찾을 수 없습니다.');
      }

      // 이미지 파일 다운로드
      const stream = fs.createReadStream(imagePath);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="barcode_${productCode}.png"`);
      
      stream.pipe(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('바코드 이미지 다운로드 중 오류가 발생했습니다.');
    }
  }

  private async writeCreateLog(result: ProductInfo, username: string) {
    await this.logService.createDetailedLog({
      moduleName: '품목관리',
      action: 'CREATE',
      username,
      targetId: result.productCode,
      targetName: result.productName,
      details: '새로운 품목 정보 생성',
    });
  }

  private async writeCreateFailLog(dto: CreateProductInfoDto, username: string, error: Error) {
    await this.logService
      .createDetailedLog({
        moduleName: '품목관리',
        action: 'CREATE_FAIL',
        username,
        targetId: '',
        targetName: dto.productName,
        details: `생성 실패: ${error.message}`,
      })
      .catch(() => {});
  }
}
