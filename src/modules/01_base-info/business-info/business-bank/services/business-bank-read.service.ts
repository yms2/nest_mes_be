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


}