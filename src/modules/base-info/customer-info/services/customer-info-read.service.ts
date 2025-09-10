import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerInfo } from '../entities/customer-info.entity';
import { SearchCustomerInfoDto } from '../dto/customer-info-search.dto';
import { DateFormatter } from '../../../../common/utils/date-formatter.util';

@Injectable()
export class CustomerInfoReadService {
  constructor(
    @InjectRepository(CustomerInfo)
    private readonly customerInfoRepository: Repository<CustomerInfo>,
  ) {}

  async getCustomerInfoByNumber(
    SearchCustomerInfoDto: SearchCustomerInfoDto,
  ): Promise<CustomerInfo> {
    const { customerNumber } = SearchCustomerInfoDto;

    const customerInfo = await this.customerInfoRepository.findOne({
      where: { customerNumber },
    });

    if (!customerInfo) {
      throw new NotFoundException('거래처 정보를 찾을 수 없습니다.');
    }

    return DateFormatter.formatBusinessInfoDates(customerInfo);
  }

  async getCustomerInfoByName(
    SearchCustomerInfoDto: SearchCustomerInfoDto,
  ): Promise<CustomerInfo> {
    const { customerName } = SearchCustomerInfoDto;

    const customerInfo = await this.customerInfoRepository.findOne({
      where: { customerName },
    });

    if (!customerInfo) {
      throw new NotFoundException('거래처 정보를 찾을 수 없습니다.');
    }

    return DateFormatter.formatBusinessInfoDates(customerInfo);
  }

  async getAllCustomerInfo(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: CustomerInfo[]; total: number; page: number; limit: number }> {
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
