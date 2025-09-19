//품질기준정보 핸들러

import { Injectable } from "@nestjs/common";

@Injectable()
export class CriteriaHandler {
    //품질기준정보 코드 자동 생성

    async generateCriteriaCode(criteriaRepository: any): Promise<string> {
        const today = new Date();
        const dateStr = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
        
        const count = await criteriaRepository
            .createQueryBuilder('criteria')
            .where('criteria.criteriaCode LIKE :pattern', { pattern: `CRI${dateStr}%` })
            .getCount();

        const sequence = (count + 1).toString().padStart(3, '0');

        return `CRI${dateStr}${sequence}`;
    }
}