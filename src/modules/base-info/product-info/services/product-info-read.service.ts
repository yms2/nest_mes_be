import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { ProductInfo } from "../entities/product-info.entity";
import { DateFormatter } from "../../../../common/utils/date-formatter.util";


@Injectable()
export class ProductInfoReadService {
  constructor(
    @InjectRepository(ProductInfo)
    private readonly productInfoRepository: Repository<ProductInfo>,
  ) {}

    async getAllProductInfo(page: number = 1, limit: number = 10): Promise<{ data: ProductInfo[]; total: number; page: number; limit: number }> {
      const offset = (page - 1) * limit;
  
      const [data, total] = await this.productInfoRepository.findAndCount({
        order: { productName: 'ASC' },
        skip: offset,
        take: limit,
      });
  
      return {
        data,
        total,
        page,
        limit,
      };
    }

}