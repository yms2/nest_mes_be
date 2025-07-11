import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductInfo } from "../entities/product-info.entity";
import { Repository } from "typeorm";
import { CreateProductInfoDto } from "../dto/product-info-create.dto";

@Injectable()
export class ProductInfoUpdateService {
  constructor(
    @InjectRepository(ProductInfo)
    private readonly productInfoRepository: Repository<ProductInfo>,
  ) {}
  
  async updateProductInfo(
    id: number,
    createProductInfoDto: CreateProductInfoDto,
    updatedBy: string,
  ): Promise<ProductInfo> {
    const existingProductInfo = await this.findProductInfoById(id);

    const updatedProductInfo = {
      ...existingProductInfo,
      ...createProductInfoDto,
      updatedBy,
      updatedAt: new Date(),
    };

    return this.productInfoRepository.save(updatedProductInfo);
  }

  public async findProductInfoById(id: number): Promise<ProductInfo> {
    const productInfo = await this.productInfoRepository.findOne({
      where: {id},
    });

    if(!productInfo){
      throw new NotFoundException('품목 정보를 찾을 수 없습니다.');
    }
    
    return productInfo;
  }
}