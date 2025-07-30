import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInfo } from '../../entities/business-info.entity';

interface ProcessingResult {
  success: number;
  duplicates: Array<{
    row: number;
    businessNumber: string;
    message: string;
  }>;
}

@Injectable()
export class BusinessUploadProcessingService {
  constructor(
    @InjectRepository(BusinessInfo)
    private readonly businessInfoRepository: Repository<BusinessInfo>,
  ) {}

  /**
   * 데이터 처리 및 저장
   */
  async processAndSaveData(
    validData: Partial<BusinessInfo>[],
    mode: 'add' | 'overwrite',
    createdBy: string,
  ): Promise<ProcessingResult> {
    // 중복 검사
    const duplicateResult = await this.checkDuplicates(validData);
    
    // 사업장 코드 생성 및 저장
    const saveResult = await this.saveBusinessInfo(
      duplicateResult.uniqueData,
      mode,
      createdBy,
    );

    return {
      success: saveResult.success,
      duplicates: duplicateResult.duplicates,
    };
  }

  /**
   * 중복 검사
   */
  private async checkDuplicates(
    validData: Partial<BusinessInfo>[],
  ): Promise<{
    duplicates: Array<{ row: number; businessNumber: string; message: string }>;
    uniqueData: Partial<BusinessInfo>[];
  }> {
    const duplicates: Array<{ row: number; businessNumber: string; message: string }> = [];
    const uniqueData: Partial<BusinessInfo>[] = [];

    for (let i = 0; i < validData.length; i++) {
      const data = validData[i];
      const businessNumber = data.businessNumber;

      if (!businessNumber) continue;

      // 기존 데이터베이스에서 중복 검사
      const existingBusiness = await this.businessInfoRepository.findOne({
        where: { businessNumber, isDeleted: false },
      });

      if (existingBusiness) {
        duplicates.push({
          row: i + 2,
          businessNumber,
          message: '이미 등록된 사업자번호입니다.',
        });
        continue;
      }

      // 현재 업로드 데이터 내에서 중복 검사
      const isDuplicateInUpload = validData
        .slice(0, i)
        .some((prevData) => prevData.businessNumber === businessNumber);

      if (isDuplicateInUpload) {
        duplicates.push({
          row: i + 2,
          businessNumber,
          message: '업로드 파일 내에서 중복된 사업자번호입니다.',
        });
        continue;
      }

      uniqueData.push(data);
    }

    return { duplicates, uniqueData };
  }

  /**
   * 비즈니스 정보 저장
   */
  private async saveBusinessInfo(
    validData: Partial<BusinessInfo>[],
    mode: 'add' | 'overwrite',
    createdBy: string,
  ): Promise<{ success: number }> {
    let successCount = 0;

    for (const data of validData) {
      try {
        // 사업장 코드 자동 생성
        const businessCode = await this.generateBusinessCode();
        data.businessCode = businessCode;
        data.createdBy = createdBy;

        if (mode === 'overwrite') {
          // 기존 데이터가 있으면 업데이트
          const existingBusiness = await this.businessInfoRepository.findOne({
            where: { businessNumber: data.businessNumber, isDeleted: false },
          });

          if (existingBusiness) {
            await this.businessInfoRepository.update(
              { id: existingBusiness.id },
              {
                ...data,
                updatedBy: createdBy,
                updatedAt: new Date(),
              },
            );
          } else {
            await this.businessInfoRepository.save(data);
          }
        } else {
          // 새로 추가
          await this.businessInfoRepository.save(data);
        }
        successCount++;
      } catch (error) {
        console.error('데이터 저장 오류:', error);
      }
    }

    return { success: successCount };
  }

  /**
   * 사업장 코드 자동 생성
   */
  private async generateBusinessCode(): Promise<string> {
    const lastBusiness = await this.businessInfoRepository.findOne({
      where: { isDeleted: false },
      order: { businessCode: 'DESC' },
    });

    let nextNumber = 1;
    if (lastBusiness && lastBusiness.businessCode) {
      const lastNumber = parseInt(lastBusiness.businessCode.replace('BUS', ''), 10);
      nextNumber = lastNumber + 1;
    }

    return `BUS${nextNumber.toString().padStart(3, '0')}`;
  }
} 