import { ClassSerializerInterceptor, Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { logService } from '../../../log/Services/log.service';
import { Auth } from "src/common/decorators/auth.decorator";
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CustomerInfoReadService } from "../services/";

@ApiTags('CustomerInfo')
@Controller('customer-info')
@UseInterceptors(ClassSerializerInterceptor)
export class CustomerInfoReadController {
  constructor(
     private readonly customerInfoReadService: CustomerInfoReadService,
    // private readonly customerInfoSearchService: CustomerInfoSearchService,
     private readonly logService: logService,
  ) {}

  @Get()
  @Auth()
  async getCustomerInfo(
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('customerNumber') customerNumber?: string,
  ) {
    if(customerNumber) {
       return this.handleSingleRead(customerNumber);
    }

    // if (startDate && endDate) {
    //   return this.handleDateRangeSearch(startDate, endDate, pagination);
    // }

    // if (search) {
    //   return this.handleSearch(search, pagination);
    // }

      return this.handleListRead(pagination);
  }

    private async handleSingleRead(customerNumber: string) {
    const result = await this.customerInfoReadService.getCustomerInfoByNumber(customerNumber);
    return { success: true, data: result };
  }


  private async handleListRead(pagination: PaginationDto) {
    const result = await this.customerInfoReadService.getAllCustomerInfo(pagination.page, pagination.limit);
    return { success: true, ...result };
  }

}