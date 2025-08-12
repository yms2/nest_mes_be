import { Injectable, NotFoundException } from '@nestjs/common';
import { Brackets, In, Repository } from 'typeorm';
import { EmployeeBank } from '../entities/employee-bank.entity';
import { ReadEmployeeBankDto } from '../dto/employee-bank-read.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class EmployeeBankReadService {
  constructor(
    @InjectRepository(EmployeeBank)
    private readonly employeeBankRepository: Repository<EmployeeBank>,
  ) {}

  async getEmployeeBanksWithSearchAndPaging(
    query: ReadEmployeeBankDto,
    pagination: PaginationDto,
  ): Promise<{ data: EmployeeBank[]; total: number }> {
    const { employeeCode, search } = query;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const qb = this.employeeBankRepository.createQueryBuilder('employeeBank');

    qb.where('employeeBank.employeeCode = :employeeCode', { employeeCode });

    if (search?.trim()) {
      qb.andWhere(
        new Brackets(qb => {
          qb.where('employeeBank.bankName LIKE :search', { search: `%${search.trim()}%` })
            .orWhere('employeeBank.accountHolder LIKE :search', { search: `%${search.trim()}%` })
            .orWhere('employeeBank.accountNumber LIKE :search', { search: `%${search.trim()}%` });
        }),
      );
    }

    const [data, total] = await qb
      .orderBy('employeeBank.bankName', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

}