import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseProduct } from '../entities/base-product.entity';
import { BaseProductCreateDto } from '../dto/base-product-create.dto';
import { CustomerInfo } from '@/modules/01_base-info/customer-info/entities/customer-info.entity';

@Injectable()
export class BaseProductCreateService {
  constructor(
    @InjectRepository(BaseProduct)
    private readonly baseProductRepository: Repository<BaseProduct>,

    @InjectRepository(CustomerInfo)
    private readonly customerInfoRepository: Repository<CustomerInfo>,
  ) {}

  async createBaseProduct(
    createBaseProductDto: BaseProductCreateDto,
    createdBy: string,
  ): Promise<BaseProduct> {
    const { productName, productCustomerCode } = createBaseProductDto;

    // 1. 중복 검사
    await this.checkProductDuplicate(productName);

    // 2. 제품 코드 생성
    const newProductCode = await this.generateProductCode();

    // 3. 거래처 엔티티 조회
    const customer = await this.customerInfoRepository.findOneBy({
      customerCode: productCustomerCode,
    });
    if (!customer) {
      throw new BadRequestException('해당 거래처 코드가 존재하지 않습니다.');
    }

    // 4. 엔티티 생성
    const baseProductEntity = this.baseProductRepository.create({
      ...createBaseProductDto,
      productCode: newProductCode,
      createdBy,
      customer, // 💡 이게 핵심: customer 객체를 넣어야 외래키가 들어감
    });

    // 5. 저장
    return this.baseProductRepository.save(baseProductEntity);
  }

  private async checkProductDuplicate(productName: string): Promise<void> {
    const existingProduct = await this.baseProductRepository.findOne({
      where: { productName },
    });
    if (existingProduct) {
      throw new ConflictException(`같은 품목 명이 이미 존재합니다.`);
    }
  }

  private async generateProductCode(): Promise<string> {
    const [lastProduct] = await this.baseProductRepository.find({
      order: { productCode: 'DESC' },
      take: 1,
    });

    const nextNumber = lastProduct?.productCode
      ? parseInt(lastProduct.productCode.slice(3), 10) + 1
      : 1;

    return `PRD${nextNumber.toString().padStart(3, '0')}`;
  }
}