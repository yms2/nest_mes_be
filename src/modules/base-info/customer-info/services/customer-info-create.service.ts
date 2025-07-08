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

  /**
   * 거래처 생성
   */
  async createCustomerInfo(
    createCustomerInfoDto: CreateCustomerInfoDto,
    createdBy: string,
  ): Promise<CustomerInfo> {
    // 1. 사업자번호 중복 체크
    await this.checkCustomerNumberDuplicate(createCustomerInfoDto.customerNumber);

    // 2. 거래처 코드 생성
    const newCustomerCode = await this.generateCustomersCode();

    // 3. 거래처 정보 저장
    return this.saveCustomerInfo(createCustomerInfoDto, newCustomerCode, createdBy);
  }

  /**
   * 사업자등록번호 중복 체크
   */
  private async checkCustomerNumberDuplicate(customerNumber: string): Promise<void> {
    const existingCustomer = await this.customerInfoRepository.findOne({
      where: { customerNumber },
    });
    if (existingCustomer) {
      throw new ConflictException(`거래처 번호가 이미 존재합니다.`);
    }
  }

  /**
   * 거래처 코드 생성 (기존 코드 +1, 없으면 C001부터 시작)
   */
private async generateCustomersCode(): Promise<string> {
  const lastCustomer = await this.customerInfoRepository.find({
    order: { customerCode: 'DESC' },
    take: 1,
  });

  let nextNumber = 1;
  if (lastCustomer[0]?.customerCode) {
    const numberPart = parseInt(lastCustomer[0].customerCode.slice(1), 10);
    nextNumber = numberPart + 1;
  }

  return `C${nextNumber.toString().padStart(3, '0')}`;
}


  /**
   * 거래처 정보 저장
   */
  private async saveCustomerInfo(
    dto: CreateCustomerInfoDto,
    customerCode: string,
    createdBy: string,
  ): Promise<CustomerInfo> {
    const newCustomerInfo = this.customerInfoRepository.create({
      customerCode,  // 필드명 수정
      ...dto,
      createdBy,
    });

    return this.customerInfoRepository.save(newCustomerInfo);
  }
}
