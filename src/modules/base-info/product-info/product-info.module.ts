import { LogModule} from "src/modules/log/log.module";
import { ProductInfoHandler } from "./handlers/product-info.handler";
import { CommonModule } from "src/common/common.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductInfo } from "./entities/product-info.entity";
import { ProductInfoReadController } from "./controllers";
import { ProductInfoSearchService, ProductInfoReadService } from "./services";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([ProductInfo])
  ],
  controllers: [
    ProductInfoReadController
    
  ],
  providers: [
    ProductInfoSearchService,
    ProductInfoReadService,
    ProductInfoHandler
  ],
  exports: [
    ProductInfoSearchService,
    ProductInfoReadService,
  ],
})
export class ProductInfoModule {}