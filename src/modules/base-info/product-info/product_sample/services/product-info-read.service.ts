import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductInfo } from '../entities/product-info.entity';
import { CustomerInfo } from '../../../customer-info/entities/customer-info.entity';
import { DateFormatter } from '../../../../../common/utils/date-formatter.util';

@Injectable()
export class ProductInfoReadService {
  constructor(
    @InjectRepository(ProductInfo)
    private readonly productInfoRepository: Repository<ProductInfo>,
    @InjectRepository(CustomerInfo)
    private readonly customerInfoRepository: Repository<CustomerInfo>,
  ) {}

  async getAllProductInfo(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    // 기본 품목 정보 조회
    const [products, total] = await this.productInfoRepository.findAndCount({
      order: { productName: 'ASC' },
      skip: offset,
      take: limit,
    });

    // 거래처 정보와 함께 데이터 구성
    const data = await Promise.all(
      products.map(async (product) => {
        let customerName = '';
        
        if (product.customerCode) {
          const customer = await this.customerInfoRepository.findOne({
            where: { customerCode: product.customerCode },
            select: ['customerName'],
          });
          customerName = customer?.customerName || '';
        }

        return {
          ...product,
          customerName,
          createdAt: DateFormatter.formatDate(product.createdAt),
          updatedAt: DateFormatter.formatDate(product.updatedAt),
        };
      })
    );

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * 바코드 번호로 품목 정보 조회
   * @param barcodeNumber 바코드 번호
   * @returns 품목 정보
   */
  async getProductInfoByBarcode(barcodeNumber: string): Promise<any> {
    if (!barcodeNumber || barcodeNumber.trim() === '') {
      throw new NotFoundException('바코드 번호가 필요합니다.');
    }

    // 바코드 번호로 품목 정보 조회
    const product = await this.productInfoRepository.findOne({
      where: { barcodeNumber: barcodeNumber.trim() },
    });

    if (!product) {
      throw new NotFoundException(`바코드 번호 '${barcodeNumber}'에 해당하는 품목을 찾을 수 없습니다.`);
    }

    // 거래처 정보 조회
    let customerName = '';
    if (product.customerCode) {
      const customer = await this.customerInfoRepository.findOne({
        where: { customerCode: product.customerCode },
        select: ['customerName'],
      });
      customerName = customer?.customerName || '';
    }

    return {
      ...product,
      customerName,
      createdAt: DateFormatter.formatDate(product.createdAt),
      updatedAt: DateFormatter.formatDate(product.updatedAt),
    };
  }

  /**
   * 바코드 번호로 품목 정보 검색 (부분 일치)
   * @param barcodeNumber 바코드 번호 (부분 일치)
   * @param page 페이지 번호
   * @param limit 페이지당 항목 수
   * @returns 품목 정보 목록
   */
  async searchProductInfoByBarcode(
    barcodeNumber: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    if (!barcodeNumber || barcodeNumber.trim() === '') {
      throw new NotFoundException('검색할 바코드 번호가 필요합니다.');
    }

    const offset = (page - 1) * limit;

    // 바코드 번호로 부분 일치 검색
    const [products, total] = await this.productInfoRepository
      .createQueryBuilder('product')
      .where('product.barcodeNumber LIKE :barcodeNumber', { 
        barcodeNumber: `%${barcodeNumber.trim()}%` 
      })
      .orderBy('product.productName', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    // 거래처 정보와 함께 데이터 구성
    const data = await Promise.all(
      products.map(async (product) => {
        let customerName = '';
        
        if (product.customerCode) {
          const customer = await this.customerInfoRepository.findOne({
            where: { customerCode: product.customerCode },
            select: ['customerName'],
          });
          customerName = customer?.customerName || '';
        }

        return {
          ...product,
          customerName,
          createdAt: DateFormatter.formatDate(product.createdAt),
          updatedAt: DateFormatter.formatDate(product.updatedAt),
        };
      })
    );

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
