import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseProduct } from '../entities/base-product.entity';

@Injectable()
export class BaseProductDeleteService {
  constructor(
    @InjectRepository(BaseProduct)
    private readonly baseProductRepository: Repository<BaseProduct>,
  ) {}

  async hardDeleteBaseProduct(id: number): Promise<void> {
    // 1. 기본 제품 정보 존재 여부 확인
    const existingBaseProduct = await this.findBaseProductById(id);

    // 2. 하드 삭제 (실제 DB에서 삭제)
    await this.baseProductRepository.remove(existingBaseProduct);
  }

  private async findBaseProductById(id: number): Promise<BaseProduct> {
    const baseProduct = await this.baseProductRepository.findOne({
      where: { id },
    });
    if (!baseProduct) {
      throw new NotAcceptableException('기본 제품 정보를 찾을 수 없습니다.');
    }

    return baseProduct;
  }
}