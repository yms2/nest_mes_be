import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerBank } from '../entities/customer-bank.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerBankDeleteService {
  constructor(
    @InjectRepository(CustomerBank)
    private readonly customerBankRepository: Repository<CustomerBank>,
  ) {}

  async hardDeleteCustomerBank(id: number): Promise<void> {
    // 1. 거래처 은행 정보 존재 여부 확인
    const existingCustomerBank = await this.findCustomerBankById(id);

    // 2. 하드 삭제 (실제 DB에서 삭제)
    await this.customerBankRepository.remove(existingCustomerBank);
  }

  private async findCustomerBankById(id: number): Promise<CustomerBank> {
    const customerBank = await this.customerBankRepository.findOne({
      where: { id },
    });

    if (!customerBank) {
      throw new NotAcceptableException('거래처 은행 정보를 찾을 수 없습니다.');
    }

    return customerBank;
  }
}