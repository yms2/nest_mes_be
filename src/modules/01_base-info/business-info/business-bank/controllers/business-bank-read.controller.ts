import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BusinessBankHandler } from '../handlers/business-bank.handler';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('BusinessBank')
@Controller('business-bank')
export class BusinessBankReadController {
  constructor(private readonly businessBankHandler: BusinessBankHandler) {}


}
