import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductInfo } from '../../entities/product-info.entity';
import { ProductUploadValidationService, ProductExcelRow } from './product-upload-validation.service';
import { ProductUploadProcessingService } from './product-upload-processing.service';
import { ProductUploadSessionService } from './product-upload-session.service';

export interface ValidationResponse {
  success: boolean;
  message: string;
  data: {
    validationId: string;
    result: any;
  };
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    totalCount: number;
    newCount: number;
    updateCount: number;
    errorCount: number;
  };
}

@Injectable()
export class ProductUploadService {
  constructor(
    @InjectRepository(ProductInfo)
    private readonly productInfoRepository: Repository<ProductInfo>,
    private readonly validationService: ProductUploadValidationService,
    private readonly processingService: ProductUploadProcessingService,
    private readonly sessionService: ProductUploadSessionService,
  ) {}

  async validateExcel(buffer: Buffer): Promise<ValidationResponse> {
    // 엑셀 파일 파싱
    const rows = this.validationService.parseExcelFile(buffer);

    // 기존 품목 데이터 조회
    const existingProducts = await this.getExistingProducts();

    // 검증 수행
    const result = this.validationService.validateRows(rows, existingProducts);

    // 세션 생성
    const validationId = `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessionService.createSession(validationId, rows, result);

    return {
      success: true,
      message: '품목 정보 검증이 완료되었습니다.',
      data: {
        validationId,
        result,
      },
    };
  }

  async processValidatedData(validationId: string, mode: 'add' | 'overwrite'): Promise<UploadResponse> {
    const session = this.sessionService.getSession(validationId);
    if (!session) {
      throw new NotFoundException('검증 세션을 찾을 수 없습니다.');
    }

    // 데이터 처리
    const result = await this.processingService.processValidatedData(
      session.rows,
      mode,
      'admin', // TODO: 실제 사용자 정보로 변경
    );

    // 세션 삭제
    this.sessionService.deleteSession(validationId);

    return {
      success: true,
      message: '품목 정보 업로드가 완료되었습니다.',
      data: {
        totalCount: result.totalCount,
        newCount: result.newCount,
        updateCount: result.updateCount,
        errorCount: 0,
      },
    };
  }

  private async getExistingProducts(): Promise<Map<string, ProductInfo>> {
    const products = await this.productInfoRepository.find({
      select: ['productName'],
    });

    const productMap = new Map<string, ProductInfo>();
    products.forEach(product => {
      productMap.set(product.productName, product);
    });

    return productMap;
  }
}
