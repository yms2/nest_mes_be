import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SubCode } from "../entities/setting.entity";
import { SettingReadService } from "./setting-read.service";
import { UpdateSubCodeDto } from "../dto/setting-update.entity";

@Injectable()
export class SettingUpdateService {
  constructor(
    @InjectRepository(SubCode)
    private readonly subCodeRepository: Repository<SubCode>,
  ) {}

  async updateSubCode(id: number, updateSubCodeDto: UpdateSubCodeDto): Promise<SubCode> {
    const subCode = await this.subCodeRepository.findOne({ where: { id } });
    if (!subCode) {
      throw new NotFoundException('SubCode not found');
    }
    this.validateUpdateData(updateSubCodeDto);
    return this.subCodeRepository.save({ ...subCode, ...updateSubCodeDto });
  }

  private async validateUpdateData(updateSubCodeDto: UpdateSubCodeDto): Promise<void> {
    if (!updateSubCodeDto.baseCodeId) {
      throw new BadRequestException('BaseCodeId is required');
    }
    if (!updateSubCodeDto.subCodeName) {
      throw new BadRequestException('SubCodeName is required');
    }
  }
}