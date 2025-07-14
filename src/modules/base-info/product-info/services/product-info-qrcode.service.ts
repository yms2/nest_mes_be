import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as QRCode from 'qrcode';
import { ProductInfo } from "../entities/product-info.entity";

@Injectable()
export class ProductInfoQrCodeService {
  constructor(
    @InjectRepository(ProductInfo)
    private readonly productRepository: Repository<ProductInfo>,
  ) {}

  async generateQrCode(productCode: string): Promise<string> {
    const product = await this.productRepository.findOneBy({ productCode });

    if (!product) {
      throw new NotFoundException(`해당하는 품목이 없습니다.`);
    }

    // ✅ QR에 포함할 링크 URL
    const localIp = '172.30.1.82'
    const targetUrl = `http://${localIp}:3000/product/${product.productCode}`; // ← 실제 도메인으로 변경

    // ✅ URL을 QR로 인코딩
    const qrImageUrl = await QRCode.toDataURL(targetUrl);

    return qrImageUrl;
  }
}
