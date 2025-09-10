import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BusinessBank } from "../entities/business-bank.entity";
import { Repository } from "typeorm";

@Injectable()
export class BusinessBankDeleteService {

  constructor(
    @InjectRepository(BusinessBank)
    private readonly businessBankRepository: Repository<BusinessBank>,
  ) {}

  async hardDeleteBusinessBank(id: number): Promise<void> {
    // 1. 사업장 은행 정보 존재 여부 확인
    const existingBusinessBank = await this.findBusinessBankById(id);

    // 2. 하드 삭제 (실제 DB에서 삭제)
    await this.businessBankRepository.remove(existingBusinessBank);
  }

  private async findBusinessBankById(id: number): Promise<BusinessBank> {
    const businessBank = await this.businessBankRepository.findOne({
      where: { id },
    });
    
    if (!businessBank) {
      throw new NotFoundException('사업장 은행 정보를 찾을 수 없습니다.');
    }

    return businessBank;
  }
}