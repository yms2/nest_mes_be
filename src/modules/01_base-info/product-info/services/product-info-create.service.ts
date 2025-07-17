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

  private async generateProductCode(): Promise<string> {
    const [lastProduct] = await this.productInfoREpository.find({
      order: { productCode: 'DESC' },
      take: 1,
    });

    const nextNumber = lastProduct?.productCode
      ? parseInt(lastProduct.productCode.slice(1), 10) + 1
      : 1;

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
