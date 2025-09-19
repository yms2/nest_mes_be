import { Repository } from "typeorm";
import { QualityCriteria } from "../entities/quality-criteria.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable, NotFoundException } from "@nestjs/common";
import { logService } from "@/modules/log/Services/log.service";
import { CriteriaHandler } from "../handler/criteria.handler";
import { CreateCriteriaDto } from "../dto/criteria.dto";



@Injectable()
export class QualityCriteriaCreateService {
    constructor(
        @InjectRepository(QualityCriteria)
        private readonly qualityCriteriaRepository: Repository<QualityCriteria>,
        private readonly logService: logService,
        private readonly criteriaHandler: CriteriaHandler,
    ) {}

    //품질기준정보 등록
        async createQualityCriteria(qualityCriteria: CreateCriteriaDto, username: string = 'system') {
            try {

            //품질기준정보 코드 자동 생성
            if (!qualityCriteria.criteriaCode) {
                qualityCriteria.criteriaCode = await this.criteriaHandler.generateCriteriaCode(this.qualityCriteriaRepository);
            }

            const newQualityCriteria = this.qualityCriteriaRepository.create({
                ...qualityCriteria,
                createdBy: username,
                updatedBy: username,
            });

            const savedQualityCriteria = await this.qualityCriteriaRepository.save(newQualityCriteria);

            await this.logService.createDetailedLog({
                moduleName: '품질기준정보 등록',
                action: 'CREATE_SUCCESS',
                username: username,
                targetId: savedQualityCriteria.id.toString(),
                targetName: savedQualityCriteria.criteriaName,
                details: '품질기준정보 등록 완료',
            });

            return {
                success: true,
                message: '품질기준정보 등록 성공',
                qualityCriteria: savedQualityCriteria,
            };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '품질기준정보 등록',
                action: 'CREATE_FAIL',
                username: username,
                targetId: '',
                targetName: qualityCriteria.criteriaName,
                details: '품질기준정보 등록 실패',
            });
            return {
                success: false,
                message: '품질기준정보 등록 실패',
                error: error.message,
            };
        }
        
    }

    //품질기준정보 조회
    async getQualityCriteria(criteriaCode: string) {
        const qualityCriteria = await this.qualityCriteriaRepository.findOne({
            where: { criteriaCode: criteriaCode.trim() },
        });

        if (!qualityCriteria) {
            throw new NotFoundException('품질기준정보를 찾을 수 없습니다.');
        }

        return qualityCriteria;
        
    }
    
    
}
