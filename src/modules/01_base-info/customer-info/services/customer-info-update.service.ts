import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerInfo } from '../entities/custmoer-info.entity';
import { CreateCustomerInfoDto } from '../dto/customer-info-create.dto';

@Injectable()
export class CustomerInfoUpdateService {
  constructor(
    @InjectRepository(CustomerInfo)
    private readonly customerInfoRepository: Repository<CustomerInfo>,
  ) {}

  async updateCustomerInfo(
    id: number,
    createCustomerInfoDto: CreateCustomerInfoDto,
    updatedBy: string,
  ): Promise<CustomerInfo> {
    const existingCustomerInfo = await this.findCustomerInfoById(id);

    // ✅ customerNumber가 변경되었는지 확인 후 중복 검증
    if (
      createCustomerInfoDto.customerNumber &&
      createCustomerInfoDto.customerNumber !== existingCustomerInfo.customerNumber
    ) {
      await this.checkCustomerNumberDuplicate(createCustomerInfoDto.customerNumber, id); // 본인 id 전달
    }

    const updatedCustomerInfo = {
      ...existingCustomerInfo,
      ...createCustomerInfoDto,
      updatedBy,
      updatedAt: new Date(),
    };

    return this.customerInfoRepository.save(updatedCustomerInfo);
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

private async checkCustomerNumberDuplicate(customerNumber: string, currentCustomerId?: number): Promise<void> {
  const existing = await this.customerInfoRepository.findOne({
    where: { customerNumber },
  });
  // 다른 사람의 데이터인 경우에만 예외 발생
  if (existing && existing.id !== currentCustomerId) {
    throw new BadRequestException('이미 등록된 거래처입니다.');
  }
}
}
