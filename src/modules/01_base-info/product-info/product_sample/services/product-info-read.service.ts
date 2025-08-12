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

    // 기본 품목 정보 조회
    const [products, total] = await this.productInfoRepository.findAndCount({
      order: { productName: 'ASC' },
      skip: offset,
      take: limit,
    });

    // 거래처 정보와 함께 데이터 구성
    const data = await Promise.all(
      products.map(async (product) => {
        let customerName = '';
        
        if (product.customerCode) {
          const customer = await this.customerInfoRepository.findOne({
            where: { customerCode: product.customerCode },
            select: ['customerName'],
          });
          customerName = customer?.customerName || '';
        }

        return {
          ...product,
          customerName,
          createdAt: DateFormatter.formatDate(product.createdAt),
          updatedAt: DateFormatter.formatDate(product.updatedAt),
        };
      })
    );

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
