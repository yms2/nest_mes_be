import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { BomInfo } from '../entities/bom-info.entity';
import { ProductInfo } from '../../product-info/product_sample/entities/product-info.entity';
import { logService } from 'src/modules/log/Services/log.service';
import { CreateBomDto } from '../dto/create-bom.dto';

export interface UpdateBomDto extends Partial<CreateBomDto> {}

@Injectable()
export class BomInfoUpdateService {
  constructor(
    @InjectRepository(BomInfo)
    private readonly bomRepository: Repository<BomInfo>,
    @InjectRepository(ProductInfo)
    private readonly productRepository: Repository<ProductInfo>,
    private readonly logService: logService,
  ) {}

  /**
   * BOM 정보를 수정합니다.
   * @param id BOM ID
   * @param updateData 수정할 데이터
   * @param username 사용자명
   * @returns 수정된 BOM 정보
   */
  async updateBom(id: number, updateData: UpdateBomDto, username: string): Promise<BomInfo> {
    try {
      // 기존 BOM 정보 조회
      const existingBom = await this.bomRepository.findOne({ where: { id } });
      if (!existingBom) {
        throw new NotFoundException(`ID ${id}인 BOM을 찾을 수 없습니다.`);
      }

      // 수정 데이터 검증
      await this.validateUpdateData(updateData, existingBom);

      // 중복 검사 (상위/하위품목이 변경된 경우)
      if (updateData.parentProductCode || updateData.childProductCode) {
        await this.checkDuplicateAfterUpdate(id, updateData, existingBom);
      }

      // BOM 수정
      const updatedBom = await this.bomRepository.save({
        ...existingBom,
        ...updateData,
      });

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 수정',
        action: 'UPDATE_SUCCESS',
        username,
        targetId: id.toString(),
        targetName: `${updatedBom.parentProductCode} → ${updatedBom.childProductCode}`,
        details: `BOM 수정 성공: ID ${id}`,
      });

      return updatedBom;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 수정',
        action: 'UPDATE_FAIL',
        username,
        targetId: id.toString(),
        targetName: '',
        details: `BOM 수정 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * 수정 데이터의 유효성을 검증합니다.
   * @param updateData 수정할 데이터
   * @param existingBom 기존 BOM 정보
   */
  private async validateUpdateData(updateData: UpdateBomDto, existingBom: BomInfo): Promise<void> {
    const { parentProductCode, childProductCode, quantity, unit } = updateData;

    // 수량 검증
    if (quantity !== undefined && quantity <= 0) {
      throw new BadRequestException('수량은 0보다 커야 합니다.');
    }

    // 단위 검증
    if (unit !== undefined && unit.length > 10) {
      throw new BadRequestException('단위는 10자를 초과할 수 없습니다.');
    }

    // 상위품목과 하위품목이 같은지 검증
    const finalParentCode = parentProductCode || existingBom.parentProductCode;
    const finalChildCode = childProductCode || existingBom.childProductCode;
    
    if (finalParentCode === finalChildCode) {
      throw new BadRequestException('상위품목과 하위품목은 같을 수 없습니다.');
    }

    // 상위품목 존재 여부 확인
    if (parentProductCode) {
      const parentProduct = await this.productRepository.findOne({
        where: { productCode: parentProductCode },
      });
      if (!parentProduct) {
        throw new BadRequestException(`상위품목 코드 ${parentProductCode}가 존재하지 않습니다.`);
      }
    }

    // 하위품목 존재 여부 확인
    if (childProductCode) {
      const childProduct = await this.productRepository.findOne({
        where: { productCode: childProductCode },
      });
      if (!childProduct) {
        throw new BadRequestException(`하위품목 코드 ${childProductCode}가 존재하지 않습니다.`);
      }
    }
  }

  /**
   * 수정 후 중복 BOM이 있는지 검사합니다.
   * @param id 현재 BOM ID
   * @param updateData 수정할 데이터
   * @param existingBom 기존 BOM 정보
   */
  private async checkDuplicateAfterUpdate(
    id: number,
    updateData: UpdateBomDto,
    existingBom: BomInfo,
  ): Promise<void> {
    const finalParentCode = updateData.parentProductCode || existingBom.parentProductCode;
    const finalChildCode = updateData.childProductCode || existingBom.childProductCode;

    const duplicateBom = await this.bomRepository.findOne({
      where: {
        parentProductCode: finalParentCode,
        childProductCode: finalChildCode,
        id: Not(id), // TypeORM에서 다른 ID 제외
      },
    });

    if (duplicateBom) {
      throw new ConflictException(
        `이미 존재하는 BOM입니다: ${finalParentCode} → ${finalChildCode}`,
      );
    }
  }
}
