import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { createCanvas } from 'canvas';
import { ProductInfo } from '../entities/product-info.entity';
import { CreateProductInfoDto } from '../dto/product-info-create.dto';

export class ProductInfoCreateService {
  constructor(
    @InjectRepository(ProductInfo)
    private readonly productInfoREpository: Repository<ProductInfo>,
  ) {}

  async createProductInfo(
    createProductInfoDto: CreateProductInfoDto,
    createdBy: string,
  ): Promise<ProductInfo> {
    const newProductCode = await this.generateProductCode();
    const newBarcodeNumber = await this.generateBarcodeNumber();
    
    // 바코드 이미지 생성
    const barcodeImagePath = await this.generateBarcodeImage(newBarcodeNumber);
    
    const productEntity = this.createProductEntity(
      createProductInfoDto, 
      newProductCode, 
      newBarcodeNumber,
      barcodeImagePath,
      createdBy
    );

    return this.productInfoREpository.save(productEntity);
  }

  // 품목 코드 생성
  private async generateProductCode(): Promise<string> {
    const [lastProduct] = await this.productInfoREpository.find({
      order: { productCode: 'DESC' },
      take: 1,
    });

    let nextNumber = 1;
    
    if (lastProduct?.productCode) {
      // PRD 접두사 제거 후 숫자 추출
      const numberPart = lastProduct.productCode.replace(/^PRD/i, '');
      const parsedNumber = parseInt(numberPart, 10);
      
      // 유효한 숫자인지 확인
      if (!isNaN(parsedNumber) && parsedNumber > 0) {
        nextNumber = parsedNumber + 1;
      }
    }

    return `PRD${nextNumber.toString().padStart(3, '0')}`;
  }

  // 바코드 넘버 생성
  private async generateBarcodeNumber(): Promise<string> {
    const [lastProduct] = await this.productInfoREpository.find({
      order: { barcodeNumber: 'DESC' },
      take: 1,
    });

    let nextNumber = 1;
    
    if (lastProduct?.barcodeNumber) {
      // 숫자 부분만 추출
      const numberPart = lastProduct.barcodeNumber.replace(/\D/g, '');
      const parsedNumber = parseInt(numberPart, 10);
      
      // 유효한 숫자인지 확인
      if (!isNaN(parsedNumber) && parsedNumber > 0) {
        nextNumber = parsedNumber + 1;
      }
    }

    // 13자리 바코드 형식으로 생성 (EAN-13 형식)
    return nextNumber.toString().padStart(13, '0');
  }

  // 바코드 이미지 생성
  private async generateBarcodeImage(barcodeNumber: string): Promise<string> {
    try {
      // Canvas 생성
      const canvas = createCanvas(300, 150);
      const ctx = canvas.getContext('2d');
      
      // 배경색 설정
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 300, 150);
      
      // 바코드 바 생성 (간단한 시각적 표현)
      ctx.fillStyle = 'black';
      const barWidth = 2;
      const barHeight = 100;
      const startX = 50;
      const startY = 25;
      
      // 바코드 숫자를 바 형태로 표현
      for (let i = 0; i < barcodeNumber.length; i++) {
        const digit = parseInt(barcodeNumber[i]);
        const barCount = digit + 1; // 0-9를 1-10으로 변환
        
        for (let j = 0; j < barCount; j++) {
          const x = startX + (i * 20) + (j * barWidth);
          if (x < 250) { // 캔버스 범위 내에서만 그리기
            ctx.fillRect(x, startY, barWidth, barHeight);
          }
        }
      }
      
      // 바코드 번호 텍스트 추가
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(barcodeNumber, 150, 140);
      
      // 이미지 파일로 저장
      const uploadsDir = path.join(process.cwd(), 'uploads', 'barcodes');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `barcode_${barcodeNumber}_${Date.now()}.png`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Canvas를 PNG 파일로 저장
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filePath, buffer);

      return `uploads/barcodes/${fileName}`;
    } catch (error) {
      console.error('바코드 이미지 생성 실패:', error);
      return '';
    }
  }

  private createProductEntity(
    dto: CreateProductInfoDto,
    productCode: string,
    barcodeNumber: string,
    barcodeImagePath: string,
    createdBy: string,
  ): ProductInfo {
    return this.productInfoREpository.create({
      productCode,
      barcodeNumber,
      barcodeImagePath,
      ...dto,
      createdBy,
    });
  }

  // 품목 코드로 상품 정보 조회
  async findProductByCode(productCode: string): Promise<ProductInfo | null> {
    return this.productInfoREpository.findOne({
      where: { productCode }
    });
  }
}
