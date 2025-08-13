import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BusinessBank } from "../entities/business-bank.entity";
import { Repository } from "typeorm";
import { CreateBusinessBankDto } from "../dto/create-business-bank.dto";
import { ValidationError } from "../../utils/business.utils";


@Injectable()
export class UpdateBusinessBankHandler {
  constructor(
    @InjectRepository(BusinessBank)
    private readonly businessBankRepository: Repository<BusinessBank>,
  ) {}

    public async findBusinessInfoByNumber(id: number): Promise<BusinessBank> {
      const businessBankInfo = await this.businessBankRepository.findOne({
        where: { id },
      });
  
      if (!businessBankInfo) {
        throw new NotFoundException('사업장 계좌 정보를 찾을 수 없습니다.');
      }
  
      return businessBankInfo;
    }

    public validateUpdateData(dto: CreateBusinessBankDto): void {
        try {
          this.validateNumberFields(dto);
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new BadRequestException(error.message);
          }
          throw error;
        }
      }
    
    private validateNumberFields(dto: CreateBusinessBankDto): void {
      if (dto.accountNumber && !/^\d+$/.test(dto.accountNumber)) {
        throw new ValidationError('계좌번호는 숫자만 포함되어야 합니다.');
      }
    }

  public async validateBusinessBankNumberUniqueness(accountNumber: string): Promise<void> {
    const existingBusinessInfo = await this.businessBankRepository.findOne({
      where: { accountNumber },
    });

    if (existingBusinessInfo) {
      throw new BadRequestException('이미 등록된 계좌입니다.');
    }
  }


}