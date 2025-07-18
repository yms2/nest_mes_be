import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseProduct } from '../entities/base-product.entity';
import { BaseProductReadDto } from '../dto/base-product-read.dto';
import { DateFormatter } from '../../../../../common/utils/date-formatter.util';

@Injectable()
export class BaseProductReadService {
  constructor(
    @InjectRepository(BaseProduct)
    private readonly baseProductRepository: Repository<BaseProduct>,
  ) {}

  async findAll(searchDto: BaseProductReadDto): Promise<{ data: BaseProduct[]; total: number }> {
    const { page = 1, limit = 10, search, startDate, endDate, productCode } = searchDto;
    
    const queryBuilder = this.baseProductRepository.createQueryBuilder('baseProduct');

    // 제품 코드 검색
    if (productCode) {
      queryBuilder.andWhere('baseProduct.productCode LIKE :productCode', {
        productCode: `%${productCode}%`,
      });
    }

    // 키워드 검색 (모든 필드에서 통합 검색)
    if (search) {
      queryBuilder.andWhere(
        `(
          baseProduct.productName LIKE :search OR 
          baseProduct.productCode LIKE :search OR 
          baseProduct.productCategory LIKE :search OR 
          baseProduct.productSize LIKE :search OR 
          baseProduct.productCustomerCode LIKE :search OR 
          baseProduct.productOrderUnit LIKE :search OR 
          baseProduct.productInventoryUnit LIKE :search OR 
          baseProduct.productQuantityPerQuantity LIKE :search OR 
          baseProduct.productSafeInventory LIKE :search OR 
          baseProduct.productIncomingTax LIKE :search OR 
          baseProduct.productIncomingPrice LIKE :search OR 
          baseProduct.productForwardingTax LIKE :search OR 
          baseProduct.productForwardingPrice LIKE :search OR 
          baseProduct.productHomepage LIKE :search OR 
          baseProduct.productBigo LIKE :search OR 
          baseProduct.createdBy LIKE :search OR 
          baseProduct.updatedBy LIKE :search
        )`,
        { search: `%${search}%` }
      );
    }

    // 날짜 범위 검색
    if (startDate && endDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      
      queryBuilder.andWhere('baseProduct.createdAt BETWEEN :startDate AND :endDate', {
        startDate: startDateTime,
        endDate: endDateTime,
      });
    }

    // 정렬 및 페이지네이션
    queryBuilder
      .orderBy('baseProduct.productName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { 
      data: DateFormatter.formatBusinessInfoArrayDates(data), 
      total 
    };
  }

  async findOne(id: number): Promise<BaseProduct> {
    const baseProduct = await this.baseProductRepository.findOne({
      where: { id },
    });

    if (!baseProduct) {
      throw new NotFoundException(`ID ${id}의 기본 제품 정보를 찾을 수 없습니다.`);
    }

    return DateFormatter.formatBusinessInfoDates(baseProduct);
  }

  // 기존 메서드 유지 (하위 호환성)
  async getAllBaseProducts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: BaseProduct[]; total: number; page: number; limit: number }> {
    const searchDto: BaseProductReadDto = {
      page,
      limit,
      search,
      startDate,
      endDate,
    };

    const result = await this.findAll(searchDto);

    return {
      ...result,
      page,
      limit,
    };
  }
}