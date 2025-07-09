import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { CustomerInfo } from "../entities/custmoer-info.entity";

@Injectable()
export class CustomerInfoReadService {
  constructor(
    @InjectRepository(CustomerInfo)
    private readonly customerInfoRepository: Repository<CustomerInfo>,
  ) {}

  async getCustomerInfoByNumber(customerNumber: string): Promise<CustomerInfo> {
    const customerInfo = await this.customerInfoRepository.findOne({
      where: { customerNumber },
    });

    if (!customerInfo) {
      throw new NotFoundException('거래처 정보를 찾을 수 없습니다.');
    }

    return customerInfo;
  }

  async getAllCustomerInfo(page: number = 1, limit: number = 10): Promise<{ data: CustomerInfo[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    const [data, total] = await this.customerInfoRepository.findAndCount({
      order: { customerName: 'ASC' },
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
