import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessBank } from '../entities/business-bank.entity';
import { CreateBusinessBankDto } from '../dto/create-business-bank.dto';
import { BadRequestException } from '@nestjs/common';

export class BusinessBankCreateService {
  constructor(
    @InjectRepository(BusinessBank)
    private readonly businessBankRepository: Repository<BusinessBank>,
  ) {}

  async createBusinessBank(
    createBusinessDto: CreateBusinessBankDto,
    createdBy: string,
  ): Promise<BusinessBank> {
    const { businessCode, accountNumber } = createBusinessDto;

    // ✅ 중복 체크
    const exists = await this.businessBankRepository.findOne({
      where: { businessCode, accountNumber },
    });

    if (exists) {
      throw new BadRequestException('해당 사업장에 이미 동일한 계좌번호가 등록되어 있습니다.');
    }

    const businessBankEntity = this.createBusinessBankEntity(createBusinessDto, createdBy);
    return this.businessBankRepository.save(businessBankEntity);
  }

  private createBusinessBankEntity(dto: CreateBusinessBankDto, createdBy: string): BusinessBank {
    return this.businessBankRepository.create({
      ...dto,
      createdBy,
    });
  }
}
