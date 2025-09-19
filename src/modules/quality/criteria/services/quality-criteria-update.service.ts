import { InjectRepository } from "@nestjs/typeorm";
import { QualityCriteria } from "../entities/quality-criteria.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { logService } from "@/modules/log/Services/log.service";
import { UpdateCriteriaDto } from "../dto/criteria-update.dto";

@Injectable()
export class QualityCriteriaUpdateService {
    constructor(
        @InjectRepository(QualityCriteria)
        private readonly qualityCriteriaRepository: Repository<QualityCriteria>,
        private readonly logService: logService,
    ) {}

    //품질기준정보 수정
    async updateQualityCriteria(id: string, qualityCriteria: UpdateCriteriaDto, username: string = 'system') {
        try {
        const { criteriaName, criteriaType, criteriaDescription } = qualityCriteria;
        const updatedQualityCriteria = await this.qualityCriteriaRepository.update(id, { criteriaName, criteriaType, criteriaDescription });
    
        await this.logService.createDetailedLog({
            moduleName: '품질기준정보 수정',
            action: 'UPDATE_SUCCESS',
            username: username,
            targetId: id,
            targetName: criteriaName,
            details: '품질기준정보 수정 완료',
        });
        return {
            success: true,
            message: '품질기준정보 수정 성공',
            qualityCriteria: updatedQualityCriteria,
        };
    } catch (error) {
        await this.logService.createDetailedLog({
            moduleName: '품질기준정보 수정',
            action: 'UPDATE_FAIL',
            username: username,
            targetId: id,
            targetName: '',
            details: '품질기준정보 수정 실패',  
        });
        return {
            success: false,
            message: '품질기준정보 수정 실패',
            error: error.message,
        };
    }
   }

   async deleteQualityCriteria(id: string, username: string = 'system') {
    try {
        const deletedQualityCriteria = await this.qualityCriteriaRepository.delete(id);
        await this.logService.createDetailedLog({
            moduleName: '품질기준정보 삭제',
            action: 'DELETE_SUCCESS',
            username: username,
            targetId: id,
            targetName: id,
            details: '품질기준정보 삭제 완료',
        });
        return {
            success: true,
            message: '품질기준정보 삭제 성공',
            qualityCriteria: deletedQualityCriteria,
        };
    } catch (error) {
        await this.logService.createDetailedLog({
            moduleName: '품질기준정보 삭제',
            action: 'DELETE_FAIL',
            username: username,
            targetId: id,
            targetName: '',
            details: '품질기준정보 삭제 실패',
        });
        return {
            success: false,
            message: '품질기준정보 삭제 실패',
            error: error.message,
        };
    }
   }
}
