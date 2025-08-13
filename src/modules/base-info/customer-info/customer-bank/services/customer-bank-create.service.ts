import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CustomerBank } from "../entities/customer-bank.entity";
import { CreateCustomerBankDto } from "../dto/customer-bank-create.dto";
import { BadRequestException } from "@nestjs/common";

export class CustomerBankCreateService {
  constructor(
    @InjectRepository(CustomerBank)
    private readonly customerBankRepository: Repository<CustomerBank>,
  ) {}

  async createCustomerBank(
    createCustomerBankDto: CreateCustomerBankDto,
    createdBy: string,
  ): Promise<CustomerBank> {
    const { customerCode, accountNumber } = createCustomerBankDto;

    // ✅ 중복 체크
    const exists = await this.customerBankRepository.findOne({
      where: { customerCode, accountNumber },
    });

    if (exists) {
      throw new BadRequestException('해당 거래처에 이미 동일한 계좌번호가 등록되어 있습니다.');
    }

    const customerBankEntity = this.createCustomerBankEntity(createCustomerBankDto, createdBy);
    return this.customerBankRepository.save(customerBankEntity);
  }

  private createCustomerBankEntity(dto: CreateCustomerBankDto, createdBy: string): CustomerBank {
    return this.customerBankRepository.create({
      ...dto,
      createdBy,
    });
  }
}