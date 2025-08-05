import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductFile } from '../entities/product-file.entity';
import { ProductInfo } from '../entities/product-info.entity';
import { ProductFileUploadDto } from '../dto/product-file-upload.dto';
import { ProductFilePreviewDto } from '../dto/product-file-preview.dto';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';
import { Response } from 'express';
import { DateFormatter } from '../../../../../common/utils/date-formatter.util';

@Injectable()
export class ProductFileService {
  private readonly uploadDir = 'uploads/products';

  constructor(
    @InjectRepository(ProductFile)
    private readonly productFileRepository: Repository<ProductFile>,
    @InjectRepository(ProductInfo)
    private readonly productInfoRepository: Repository<ProductInfo>,
  ) {
    // 업로드 디렉토리 생성
    this.ensureUploadDirectory();
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadDto: ProductFileUploadDto,
    createdBy: string,
  ): Promise<ProductFile> {
    // 품목 존재 확인
    const product = await this.productInfoRepository.findOne({
      where: { id: uploadDto.productId },
    });

    if (!product) {
      throw new NotFoundException('품목을 찾을 수 없습니다.');
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('파일 크기는 10MB를 초과할 수 없습니다.');
    }

    // 허용된 파일 타입
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('지원하지 않는 파일 형식입니다.');
    }

    // 파일명 생성 (중복 방지)
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const fileName = `product_${uploadDto.productId}_${timestamp}${fileExtension}`;

    // 년/월별 디렉토리 생성
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const uploadPath = path.join(this.uploadDir, yearMonth);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const filePath = path.join(uploadPath, fileName);
    const relativePath = path.join(yearMonth, fileName);

    // 파일 저장
    fs.writeFileSync(filePath, file.buffer);

    // DB에 파일 정보 저장
    const productFile = this.productFileRepository.create({
      productId: uploadDto.productId,
      originalFilename: file.originalname,
      filePath: relativePath,
      mimeType: file.mimetype,
      fileSize: file.size,
      description: uploadDto.description,
      fileType: uploadDto.fileType || 'document',
      createdBy,
    });

    return await this.productFileRepository.save(productFile);
  }

  async getProductFiles(productId: number): Promise<ProductFile[]> {
    return await this.productFileRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }

  async getProductFilesWithPreview(productId: number): Promise<ProductFilePreviewDto[]> {
    const files = await this.getProductFiles(productId);
    
    return files.map(file => this.convertToPreviewDto(file));
  }

  private convertToPreviewDto(file: ProductFile): ProductFilePreviewDto {
    const extension = path.extname(file.originalFilename).toLowerCase().replace('.', '');
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
    const isPdf = ['pdf'].includes(extension);
    const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension);
    const canPreview = isImage || isPdf || isVideo;

    return {
      id: file.id,
      originalFilename: file.originalFilename,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      description: file.description,
      fileType: file.fileType,
      createdAt: DateFormatter.formatDate(file.createdAt) || '',
      previewUrl: canPreview ? `/api/product-file/preview/${file.id}` : undefined,
      downloadUrl: `/api/product-file/download/${file.id}`,
      isImage,
      extension,
    };
  }

  async downloadFile(fileId: number, res: Response): Promise<void> {
    const file = await this.productFileRepository.findOne({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    const fullPath = path.join(this.uploadDir, file.filePath);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('파일이 서버에 존재하지 않습니다.');
    }

    // 파일 스트림 생성
    const fileStream = createReadStream(fullPath);

    // 응답 헤더 설정
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalFilename)}"`);

    // 파일 스트림을 응답으로 파이프
    fileStream.pipe(res);
  }

  async previewFile(fileId: number, res: Response): Promise<void> {
    const file = await this.productFileRepository.findOne({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    const fullPath = path.join(this.uploadDir, file.filePath);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('파일이 서버에 존재하지 않습니다.');
    }

    // 파일 타입 확인
    const extension = path.extname(file.originalFilename).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(extension);
    const isPdf = ['.pdf'].includes(extension);
    const isVideo = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(extension);

    // 지원하지 않는 파일 타입
    if (!isImage && !isPdf && !isVideo) {
      throw new BadRequestException('미리보기를 지원하지 않는 파일 형식입니다. (지원: 이미지, PDF, 비디오)');
    }

    // 파일 스트림 생성
    const fileStream = createReadStream(fullPath);

    // 응답 헤더 설정 (미리보기용)
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1시간 캐시

    // PDF의 경우 브라우저에서 직접 표시
    if (isPdf) {
      res.setHeader('Content-Disposition', 'inline');
    }

    // 파일 스트림을 응답으로 파이프
    fileStream.pipe(res);
  }

  async deleteFile(fileId: number): Promise<void> {
    const file = await this.productFileRepository.findOne({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    // 서버에서 파일 삭제
    const fullPath = path.join(this.uploadDir, file.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // DB에서 파일 정보 삭제
    await this.productFileRepository.remove(file);
  }

  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }
} 