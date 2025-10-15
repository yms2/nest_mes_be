// product-info-qrcode.controller.ts
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductInfoQrCodeService } from '../services';
import { Repository } from 'typeorm';
import { ProductInfo } from '../entities/product-info.entity';

@ApiTags('Product QR')
@Controller('product')
export class ProductInfoQrCodeController {
  constructor(
    private readonly qrService: ProductInfoQrCodeService,
    @InjectRepository(ProductInfo)
    private readonly productRepository: Repository<ProductInfo>,
  ) {}

  @Get(':productCode')
  @ApiOperation({ summary: '품목 정보 조회', description: '품목 코드로 품목 정보 조회' })
  async getProduct(@Param('productCode') productCode: string) {
    const product = await this.productRepository.findOneBy({ productCode });

    if (!product) {
      throw new NotFoundException(`해당하는 품목이 없습니다.`);
    }

    // ✅ QR 코드 생성ㅋ
    const qrCode = await this.qrService.generateQrCode(product.productCode);

    return {
      productCode: product.productCode,
      productName: product.productName,
      productUnit: product.productInventoryUnit,
      productType: product.productType,
      qrCode,
    };
  }
}
