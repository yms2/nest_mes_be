import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomerInfo } from '../entities/custmoer-info.entity';
import { CreateCustomerInfoDto } from '../dto/customer-info-create.dto';

@Injectable()
export class CustomerInfoCreateService {
  constructor(
    @InjectRepository(CustomerInfo)
    private readonly customerInfoRepository: Repository<CustomerInfo>,
  ) {}

  async createCustomerInfo(
    createCustomerInfoDto: CreateCustomerInfoDto,
    createdBy: string,
  ): Promise<CustomerInfo> {
    await this.checkCustomerNumberDuplicate(createCustomerInfoDto.customerNumber);
    const newCustomerCode = await this.generateCustomerCode();
    const customerEntity = this.createCustomerEntity(createCustomerInfoDto, newCustomerCode, createdBy);
    return this.customerInfoRepository.save(customerEntity);
  }

  private async checkCustomerNumberDuplicate(customerNumber: string): Promise<void> {
    const existingCustomer = await this.customerInfoRepository.findOne({ where: { customerNumber } });
    if (existingCustomer) {
      throw new ConflictException(`거래처 번호가 이미 존재합니다.`);
    }
  }

  private async generateCustomerCode(): Promise<string> {
    const [lastCustomer] = await this.customerInfoRepository.find({
      order: { customerCode: 'DESC' },
      take: 1,
    });

    const nextNumber = lastCustomer?.customerCode
      ? parseInt(lastCustomer.customerCode.slice(1), 10) + 1
      : 1;

    return `C${nextNumber.toString().padStart(3, '0')}`;
  }

  private createCustomerEntity(
    dto: CreateCustomerInfoDto,
    customerCode: string,
    createdBy: string,
  ): CustomerInfo {
    return this.customerInfoRepository.create({
      customerCode,
      ...dto,
      createdBy,
    });
  }
}
