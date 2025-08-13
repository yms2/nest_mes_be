import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CustomerBank } from "../entities/customer-bank.entity";
import { CreateCustomerBankDto } from "../dto/customer-bank-create.dto";
import { CustomerBankCreateHandler } from "../handlers/customer-bank-create.handler";

@Injectable()
export class CustomerBankUpdateService {
  constructor(
    @InjectRepository(CustomerBank)
    private readonly customerBankRepository: Repository<CustomerBank>,
    private readonly customerBankCreateHandler: CustomerBankCreateHandler,
  ) {}

  async updateCustomerBank(
    id: number,
    createCustomerBankDto: CreateCustomerBankDto,
    updatedBy: string,
  ): Promise<CustomerBank> {
    const existingCustomerBank = await this.customerBankCreateHandler.findCustomerBankById(id);

    // 입력 데이터 검증
    this.customerBankCreateHandler.validateUpdateData(createCustomerBankDto);

    // 계좌번호 중복 검증 (계좌번호가 변경되는 경우)
    if (
      createCustomerBankDto.accountNumber &&
      createCustomerBankDto.accountNumber !== existingCustomerBank.accountNumber
    ) {
      await this.customerBankCreateHandler.validateBusinessBankNumberUniqueness(createCustomerBankDto.accountNumber);
    }

    const updatedCustomerBankInfo = {
      ...existingCustomerBank,
      ...createCustomerBankDto,
      updatedBy,
      updatedAt: new Date(),
    };

    return this.customerBankRepository.save(updatedCustomerBankInfo);
  }
}