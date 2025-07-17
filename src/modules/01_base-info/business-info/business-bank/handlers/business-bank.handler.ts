import { Injectable } from '@nestjs/common';
import { BusinessBankReadService } from '../services/business-bank-read.service';
import { BusinessBankSearchService } from '../services/business-bank-search.service';
import { ReadBusinessBankDto } from '../dto/read-business-bank.dto';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { buildPaginatedResponse } from 'src/common/utils/pagination.util';

@Injectable()
export class BusinessBankHandler {
  constructor(
    private readonly businessBankReadService: BusinessBankReadService,
    private readonly businessBankSearchService: BusinessBankSearchService,
  ) {}


}
