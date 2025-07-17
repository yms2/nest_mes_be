import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessBank } from '../entities/business-bank.entity';
import { Repository, Brackets } from 'typeorm';

interface SearchResult {
  data: BusinessBank[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class BusinessBankSearchService {
  private readonly validFields = ['bankName', 'accountNumber', 'accountHolder'];

  constructor(
    @InjectRepository(BusinessBank)
    private readonly businessBankRepository: Repository<BusinessBank>,
  ) {}


}
