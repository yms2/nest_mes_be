import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessBank } from '../entities/business-bank.entity';
import { CreateBusinessBankDto } from '../dto/create-business-bank.dto';

export class BusinessBankCreateService {
  constructor(
    @InjectRepository(BusinessBank)
    private readonly businessBankRepository: Repository<BusinessBank>,
  ) {}

  async createBusinessBank(
    createBusinessDto: CreateBusinessBankDto,
    createdBy: string,
  ): Promise<BusinessBank> {
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
