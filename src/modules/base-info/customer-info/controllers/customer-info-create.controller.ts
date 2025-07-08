import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { create } from 'domain';
import { NotEmptyStringPipe } from 'src/common/pipes/not-empty-string.pipe';
import { logService } from "src/modules/log/Services/log.service";
//import { CreateCustomerInfoDto } from '../dto/create-customer-info.dto';
import { CustomerInfoCreateService } from '../services/customer-info-create.service';

@ApiTags("CutomerInfo")
@Controller('customer-info')
export class CustomerInfoCreateController {
  constructor(
    private readonly createCustomerInfoService: CustomerInfoCreateService,
    private readonly logService: logService, 
  ) {}

}