import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessBank } from '../entities/business-bank.entity';
import { CreateBusinessBankDto } from '../dto/create-business-bank.dto';
import { UpdateBusinessBankHandler } from '../handlers/update-business-bank.handler';

@Injectable()
export class BusinessBankUpdateService {
  constructor(
    @InjectRepository(BusinessBank)
    private readonly businessBankRepository: Repository<BusinessBank>,
    private readonly updateBusinessBankHandler: UpdateBusinessBankHandler,
  ) {}

  async updateBusinessBank(
    id: number,
    createBusinessBankDto: CreateBusinessBankDto,
    updatedBy: string,
  ): Promise<BusinessBank> {
    const existingBusinessBank = await this.updateBusinessBankHandler.findBusinessInfoByNumber(id);

    // 입력 데이터 검증
    this.updateBusinessBankHandler.validateUpdateData(createBusinessBankDto);

    // 계좌번호 중복 검증 (계좌번호가 변경되는 경우)
    if (
      createBusinessBankDto.accountNumber &&
      createBusinessBankDto.accountNumber !== existingBusinessBank.accountNumber
    ) {
      await this.updateBusinessBankHandler.validateBusinessBankNumberUniqueness(createBusinessBankDto.accountNumber);
    }

      const updatedBusinessBankInfo = {
      ...existingBusinessBank,
      ...createBusinessBankDto,
      updatedBy,
      updatedAt: new Date(),
    };

    return this.businessBankRepository.save(updatedBusinessBankInfo);
  }
}