import { PartialType } from '@nestjs/swagger';
import { CreateOrderInfoDto } from './create-order-info.dto';

export class UpdateOrderInfoDto extends PartialType(CreateOrderInfoDto) {}
