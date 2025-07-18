import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { BaseProduct } from "../entities/base-product.entity";
import { BaseProductCreateDto } from "../dto/base-product-create.dto";
import { CustomerInfo } from "@/modules/01_base-info/customer-info/entities/customer-info.entity";

@Injectable()
export class BaseProductUpdateService {
  constructor(
    @InjectRepository(BaseProduct)
    private readonly baseProductRepository: Repository<BaseProduct>,

    @InjectRepository(CustomerInfo)
    private readonly customerInfoRepository: Repository<CustomerInfo>,
  ) {}

  async updateBaseProduct(
    id: number,
    createBaseProductDto: BaseProductCreateDto,
    updatedBy: string,
  ): Promise<BaseProduct> {
    // 1. 제품 엔티티 조회
    const existingProduct = await this.baseProductRepository.findOneBy({ id });
    if (!existingProduct) {
      throw new Error('해당 제품이 존재하지 않습니다.');
    }

    // 2. 중복 검사
    await this.checkProductDuplicate(createBaseProductDto.productName, id);

    // 3. 거래처 엔티티 조회
    const customer = await this.customerInfoRepository.findOneBy({
      customerCode: createBaseProductDto.productCustomerCode,
    });

    if (!customer) {
      throw new Error('해당 거래처 코드가 존재하지 않습니다.');
    }

    // 4. 업데이트할 엔티티 생성
    const updatedProductEntity = this.baseProductRepository.create({
      ...existingProduct,
      ...createBaseProductDto,
      updatedBy,
      updatedAt: new Date(),
      customer, // 💡 외래키 설정
    });

    // 5. 저장
    return this.baseProductRepository.save(updatedProductEntity);
  }

  private async checkProductDuplicate(productName: string, id?: number): Promise<void> {
    const existingProduct = await this.baseProductRepository.findOne({
      where: { productName, id: id ? Not(id) : undefined },
    });
    if (existingProduct) {
      throw new ConflictException(`같은 품목 명이 이미 존재합니다.`);
    }
  }
}