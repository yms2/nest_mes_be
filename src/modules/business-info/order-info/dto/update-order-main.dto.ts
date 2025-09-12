import { PartialType } from "@nestjs/swagger";
import { CreateOrderMainDto } from "./create-order-main.dto";

export class UpdateOrderMainDto extends PartialType(CreateOrderMainDto) {}
