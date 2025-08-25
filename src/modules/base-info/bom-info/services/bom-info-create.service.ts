import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomInfo } from '../entities/bom-info.entity';
import { ProductInfo } from '../../product-info/product_sample/entities/product-info.entity';
import { logService } from 'src/modules/log/Services/log.service';
import { CreateBomDto } from '../dto/create-bom.dto';

@Injectable()
export class BomInfoCreateService {
  constructor(
    @InjectRepository(BomInfo)
    private readonly bomRepository: Repository<BomInfo>,
    @InjectRepository(ProductInfo)
    private readonly productRepository: Repository<ProductInfo>,
    private readonly logService: logService,
  ) {}

  /**
   * BOM 정보를 생성합니다.
   * @param createBomDto BOM 생성 데이터
   * @param username 사용자명
   * @returns 생성된 BOM 정보
   */
  async createBom(createBomDto: CreateBomDto, username: string): Promise<BomInfo> {
    try {
      // 입력 데이터 검증
      await this.validateBomData(createBomDto);

      // 중복 BOM 검증
      await this.checkDuplicateBom(createBomDto);

      // BOM 생성
      const bom = this.bomRepository.create(createBomDto);
      const savedBom = await this.bomRepository.save(bom);

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 등록',
        action: 'CREATE_SUCCESS',
        username,
        targetId: savedBom.id.toString(),
        targetName: `${createBomDto.parentProductCode} → ${createBomDto.childProductCode}`,
        details: `BOM 등록 성공: ${createBomDto.parentProductCode} → ${createBomDto.childProductCode} (수량: ${createBomDto.quantity} ${createBomDto.unit})`,
      });

      return savedBom;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 등록',
        action: 'CREATE_FAIL',
        username,
        targetId: '',
        targetName: `${createBomDto.parentProductCode} → ${createBomDto.childProductCode}`,
        details: `BOM 등록 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * BOM 데이터의 유효성을 검증합니다.
   * @param createBomDto BOM 생성 데이터
   */
  private async validateBomData(createBomDto: CreateBomDto): Promise<void> {
    const { parentProductCode, childProductCode, quantity, unit } = createBomDto;

    // 필수 필드 검증
    if (!parentProductCode || !childProductCode || !quantity || !unit) {
      throw new BadRequestException('모든 필드는 필수입니다.');
    }

    // 수량 검증
    if (quantity <= 0) {
      throw new BadRequestException('수량은 0보다 커야 합니다.');
    }

    // 단위 검증
    if (unit.length > 10) {
      throw new BadRequestException('단위는 10자를 초과할 수 없습니다.');
    }

    // 상위품목과 하위품목이 같은지 검증
    if (parentProductCode === childProductCode) {
      throw new BadRequestException('상위품목과 하위품목은 같을 수 없습니다.');
    }

    // 상위품목 존재 여부 확인
    const parentProduct = await this.productRepository.findOne({
      where: { productCode: parentProductCode },
    });
    if (!parentProduct) {
      throw new BadRequestException(`상위품목 코드 ${parentProductCode}가 존재하지 않습니다.`);
    }

    // 하위품목 존재 여부 확인
    const childProduct = await this.productRepository.findOne({
      where: { productCode: childProductCode },
    });
    if (!childProduct) {
      throw new BadRequestException(`하위품목 코드 ${childProductCode}가 존재하지 않습니다.`);
    }
  }

  /**
   * 중복 BOM이 있는지 검증합니다.
   * @param createBomDto BOM 생성 데이터
   */
  private async checkDuplicateBom(createBomDto: CreateBomDto): Promise<void> {
    const { parentProductCode, childProductCode } = createBomDto;

    const existingBom = await this.bomRepository.findOne({
      where: {
        parentProductCode,
        childProductCode,
      },
    });

    if (existingBom) {
      throw new ConflictException(
        `이미 존재하는 BOM입니다: ${parentProductCode} → ${childProductCode}`,
      );
    }
  }
}
