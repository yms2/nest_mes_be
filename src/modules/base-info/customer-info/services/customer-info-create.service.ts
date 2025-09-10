import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomerInfo } from '../entities/customer-info.entity';
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
    await this.checkCustomerName(createCustomerInfoDto.customerName);
    await this.checkCustomerCeo(createCustomerInfoDto.customerCeo);
    const newCustomerCode = await this.generateCustomerCode();
    const customerEntity = this.createCustomerEntity(
      createCustomerInfoDto,
      newCustomerCode,
      createdBy,
    );
    return this.customerInfoRepository.save(customerEntity);
  }

  private async checkCustomerNumberDuplicate(customerNumber: string): Promise<void> {
    const existingCustomer = await this.customerInfoRepository.findOne({
      where: { customerNumber },
    });
    if (existingCustomer) {
      throw new ConflictException(`사업자 등록번호가 이미 존재합니다.`);
    }
  }

  //거래처명이 비어있다면 예외처리
  private async checkCustomerName(customerName: string): Promise<void> {
    if (!customerName) {
      throw new BadRequestException('거래처명이 비어있습니다.');
    }
  }

  //대표자명이 비어있다면 예외처리
  private async checkCustomerCeo(customerCeo: string): Promise<void> {
    if (!customerCeo) {
      throw new BadRequestException('대표자명이 비어있습니다.');
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
