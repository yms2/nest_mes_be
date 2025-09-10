import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerInfo } from '../entities/customer-info.entity';

@Injectable()
export class CustomerInfoDeleteService {
  constructor(
    @InjectRepository(CustomerInfo)
    private readonly customerInfoRepository: Repository<CustomerInfo>,
  ) {}

  async hardDeleteCustomerInfo(id: number): Promise<void> {
    // 1. 거래처 정보 존재 여부 확인
    const existingCustomerInfo = await this.findCustomerInfoById(id);

    // 2. 하드 삭제 (실제 DB에서 삭제)
    await this.customerInfoRepository.remove(existingCustomerInfo);
  }

  private async findCustomerInfoById(id: number): Promise<CustomerInfo> {
    const customerInfo = await this.customerInfoRepository.findOne({
      where: { id },
    });
    if (!customerInfo) {
      throw new NotFoundException('거래처 정보를 찾을 수 없습니다.');
    }

    return customerInfo;
  }
}
