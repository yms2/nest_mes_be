import { LogModule} from "src/modules/log/log.module";
import { ProductInfoHandler } from "./handlers/product-info.handler";
import { CommonModule } from "src/common/common.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductInfo } from "./entities/product-info.entity";
import { ProductInfoReadController,ProductInfoCreateController,ProductInfoUpdateController, ProductInfoDeleteController } from "./controllers";
import { ProductInfoSearchService, ProductInfoReadService, ProductInfoCreateService,ProductInfoUpdateService, ProductInfoDeleteService } from "./services";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([ProductInfo])
  ],
  controllers: [
    ProductInfoReadController,
    ProductInfoCreateController,
    ProductInfoUpdateController,
    ProductInfoDeleteController
  ],
  providers: [
    ProductInfoSearchService,
    ProductInfoReadService,
    ProductInfoCreateService,
    ProductInfoUpdateService,
    ProductInfoDeleteService,
    ProductInfoHandler
  ],
  exports: [
    ProductInfoSearchService,
    ProductInfoReadService,
    ProductInfoCreateService,
    ProductInfoUpdateService,
    ProductInfoDeleteService
  ],
})
export class ProductInfoModule {}