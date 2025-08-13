import { Injectable, NotFoundException } from '@nestjs/common';
import { Brackets, In, Repository } from 'typeorm';
import { CustomerBank } from '../entities/customer-bank.entity';
import { ReadCustomerBankDto } from '../dto/customer-bank-read.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CustomerBankReadService {
  constructor(
    @InjectRepository(CustomerBank)
    private readonly customerBankRepository: Repository<CustomerBank>,
  ) {}

  async getCustomerBanksWithSearchAndPaging(
    query: ReadCustomerBankDto,
    pagination: PaginationDto,
  ): Promise<{ data: CustomerBank[]; total: number }> {
    const { customerCode, search } = query;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const qb = this.customerBankRepository.createQueryBuilder('customerBank');

    qb.where('customerBank.customerCode = :customerCode', { customerCode });

    if (search?.trim()) {
      qb.andWhere(
        new Brackets(qb => {
          qb.where('customerBank.bankName LIKE :search', { search: `%${search.trim()}%` })
            .orWhere('customerBank.accountHolder LIKE :search', { search: `%${search.trim()}%` })
            .orWhere('customerBank.accountNumber LIKE :search', { search: `%${search.trim()}%` });
        }),
      );
    }

    const [data, total] = await qb
      .orderBy('customerBank.bankName', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

}