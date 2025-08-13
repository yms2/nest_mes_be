import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SubCode } from "../entities/setting.entity";
import { UpdateSubCodeDto } from "../dto/setting-update.entity";


export class SettingCreateService {
    constructor(
        @InjectRepository(SubCode)
        private readonly subCodeRepository: Repository<SubCode>,
    ) {}

    async createSubCode(
        createSubCodeDto: UpdateSubCodeDto,
        createdBy: string,
    ): Promise<SubCode> {
        const newSubCode = await this.generateSubCode();
        const subCodeEntity = this.createSubCodeEntity(createSubCodeDto, newSubCode, createdBy);

        return this.subCodeRepository.save(subCodeEntity);
    }

    private async generateSubCode(): Promise<string> {
        const [lastSubCode] = await this.subCodeRepository.find({
            order: { subCode: 'DESC' },
            take: 1,
        });

        let nextNumber = 1;

        if (lastSubCode?.subCode) {
            const numberPart = lastSubCode.subCode.replace(/^SC/i, '');
            nextNumber = parseInt(numberPart) + 1;
        }

        return `SC${nextNumber.toString().padStart(3, '0')}`;
    }

    private createSubCodeEntity(
        dto: UpdateSubCodeDto,
        newSubCode: string,
        createdBy: string,
    ): SubCode {
        const entity = this.subCodeRepository.create({
            subCode: newSubCode,
            subCodeName: dto.subCodeName,
            subCodeDescription: dto.subCodeDescription,
            baseCodeId: dto.baseCodeId,
            createdBy,
        });
        
     
        return entity;
    }
}