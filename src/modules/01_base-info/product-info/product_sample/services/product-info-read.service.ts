import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductInfo } from '../entities/product-info.entity';
import { CustomerInfo } from '../../../customer-info/entities/customer-info.entity';
import { DateFormatter } from '../../../../../common/utils/date-formatter.util';

@Injectable()
export class ProductInfoReadService {
  constructor(
    @InjectRepository(ProductInfo)
    private readonly productInfoRepository: Repository<ProductInfo>,
    @InjectRepository(CustomerInfo)
    private readonly customerInfoRepository: Repository<CustomerInfo>,
  ) {}

  async getAllProductInfo(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    // LEFT JOIN으로 거래처 정보와 함께 조회
    const queryBuilder = this.productInfoRepository
      .createQueryBuilder('product')
      .leftJoin('customer_info', 'customer', 'customer.customer_code = product.customer_code')
      .select([
        'product.*',
        'customer.customer_name as customerName',
      ])
      .orderBy('product.product_name', 'ASC')
      .skip(offset)
      .take(limit);

    const [data, total] = await Promise.all([
      queryBuilder.getRawMany(),
      this.productInfoRepository.count(),
    ]);

    // 날짜 포맷팅 적용
    const formattedData = data.map(item => ({
      ...item,
      createdAt: DateFormatter.formatDate(item.created_at),
      updatedAt: DateFormatter.formatDate(item.updated_at),
    }));

    return {
      data: formattedData,
      total,
      page,
      limit,
    };
  }
}
