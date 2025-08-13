import { Injectable, NotFoundException } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { BusinessBank } from '../entities/business-bank.entity';
import { ReadBusinessBankDto } from '../dto/read-business-bank.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class BusinessBankReadService {
  constructor(
    @InjectRepository(BusinessBank)
    private readonly businessBankRepository: Repository<BusinessBank>,
  ) {}

  async getBusinessBanksWithSearchAndPaging(
    query: ReadBusinessBankDto,
    pagination: PaginationDto,
  ): Promise<{ data: BusinessBank[]; total: number }> {
    const { businessCode, search } = query;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const qb = this.businessBankRepository.createQueryBuilder('businessBank');

    qb.where('businessBank.businessCode = :businessCode', { businessCode });

    if(search?.trim()){
      qb.andWhere(
        '(businessBank.bankName LIKE :search OR businessBank.accountHolder LIKE :search OR businessBank.accountNumber LIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }
    const [data, total] = await qb
    .orderBy('businessBank.bankName', 'ASC')
    .skip(offset)
    .take(limit)
    .getManyAndCount();

  return { data, total };
  }
}