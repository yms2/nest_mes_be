import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../entities/equipment.entity';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';

@Injectable()
export class EquipmentCreateService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  /**
   * 장비를 등록합니다.
   * @param createEquipmentDto 장비 생성 데이터
   * @returns 생성된 장비 정보
   */
  async createEquipment(createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    try {
      // 장비 코드가 없으면 자동 생성
      if (!createEquipmentDto.equipmentCode) {
        createEquipmentDto.equipmentCode = await this.generateEquipmentCode();
      }

      // 입력 데이터 검증
      await this.validateEquipmentData(createEquipmentDto);

      // 중복 장비 코드 검증
      await this.checkDuplicateEquipment(createEquipmentDto.equipmentCode);

      // 장비 생성
      const equipment = this.equipmentRepository.create({
        ...createEquipmentDto,
        equipmentPurchaseDate: new Date(createEquipmentDto.equipmentPurchaseDate),
      });

      const savedEquipment = await this.equipmentRepository.save(equipment);

      return savedEquipment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 장비 데이터의 유효성을 검증합니다.
   * @param createEquipmentDto 장비 생성 데이터
   */
  private async validateEquipmentData(createEquipmentDto: CreateEquipmentDto): Promise<void> {
    const { equipmentCode, equipmentName, equipmentModel, equipmentPurchasePrice } = createEquipmentDto;

    // 필수 필드 검증
    if (!equipmentName || !equipmentModel) {
      throw new BadRequestException('장비명과 모델은 필수입니다.');
    }

    // 장비 코드가 제공된 경우 형식 검증
    if (equipmentCode) {
      const codePattern = /^EQ\d{3}$/;
      if (!codePattern.test(equipmentCode)) {
        throw new BadRequestException('장비 코드는 EQ로 시작하고 3자리 숫자로 구성되어야 합니다. (예: EQ001)');
      }
    }

    // 구매가격 검증
    if (equipmentPurchasePrice < 0) {
      throw new BadRequestException('구매가격은 0 이상이어야 합니다.');
    }

    // 구매일 검증
    const purchaseDate = new Date(createEquipmentDto.equipmentPurchaseDate);
    if (isNaN(purchaseDate.getTime())) {
      throw new BadRequestException('유효한 구매일을 입력해주세요.');
    }

    // 미래 날짜 검증
    const today = new Date();
    if (purchaseDate > today) {
      throw new BadRequestException('구매일은 오늘 이전이어야 합니다.');
    }
  }

  /**
   * 중복 장비 코드가 있는지 검증합니다.
   * @param equipmentCode 장비 코드
   */
  private async checkDuplicateEquipment(equipmentCode: string): Promise<void> {
    const existingEquipment = await this.equipmentRepository.findOne({
      where: { equipmentCode },
    });

    if (existingEquipment) {
      throw new ConflictException(`이미 존재하는 장비 코드입니다: ${equipmentCode}`);
    }
  }

  /**
   * 장비 코드를 자동으로 생성합니다.
   * @returns 생성된 장비 코드
   */
  async generateEquipmentCode(): Promise<string> {
    const lastEquipment = await this.equipmentRepository.findOne({
      where: {},
      order: { equipmentCode: 'DESC' },
    });

    if (!lastEquipment) {
      return 'EQ001';
    }

    const lastNumber = parseInt(lastEquipment.equipmentCode.substring(2));
    const nextNumber = lastNumber + 1;
    return `EQ${nextNumber.toString().padStart(3, '0')}`;
  }
}
