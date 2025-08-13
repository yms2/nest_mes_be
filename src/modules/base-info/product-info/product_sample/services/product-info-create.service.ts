import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductInfo } from '../entities/product-info.entity';
import { CreateProductInfoDto } from '../dto/product-info-create.dto';

export class ProductInfoCreateService {
  constructor(
    @InjectRepository(ProductInfo)
    private readonly productInfoREpository: Repository<ProductInfo>,
  ) {}

  async createProductInfo(
    createProductInfoDto: CreateProductInfoDto,
    createdBy: string,
  ): Promise<ProductInfo> {
    const newProductCode = await this.generateProductCode();
    const productEntity = this.createProductEntity(createProductInfoDto, newProductCode, createdBy);

    return this.productInfoREpository.save(productEntity);
  }

  // 품목 코드 생성
  private async generateProductCode(): Promise<string> {
    const [lastProduct] = await this.productInfoREpository.find({
      order: { productCode: 'DESC' },
      take: 1,
    });

    let nextNumber = 1;
    
    if (lastProduct?.productCode) {
      // PRD 접두사 제거 후 숫자 추출
      const numberPart = lastProduct.productCode.replace(/^PRD/i, '');
      const parsedNumber = parseInt(numberPart, 10);
      
      // 유효한 숫자인지 확인
      if (!isNaN(parsedNumber) && parsedNumber > 0) {
        nextNumber = parsedNumber + 1;
      }
    }

    return `PRD${nextNumber.toString().padStart(3, '0')}`;
  }

  private createProductEntity(
    dto: CreateProductInfoDto,
    productCode: string,
    createdBy: string,
  ): ProductInfo {
    return this.productInfoREpository.create({
      productCode,
      ...dto,
      createdBy,
    });
  }
}
