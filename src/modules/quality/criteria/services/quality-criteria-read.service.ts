import { InjectRepository } from "@nestjs/typeorm";
import { QualityCriteria } from "../entities/quality-criteria.entity";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";


@Injectable()
export class QualityCriteriaReadService {
    constructor(
        @InjectRepository(QualityCriteria)
        private readonly qualityCriteriaRepository: Repository<QualityCriteria>,
    ) {}

    async getAllCriteria (
        page: number = 1,
        limit: number = 10,
        username: string,
        search?: string,
        criteriaName?: string,
        criteriaType?: string,
        criteriaDescription?: string,
    ) {
        try {
            const skip = (page - 1) * limit;

            const queryBuilder = this.qualityCriteriaRepository
                .createQueryBuilder('qualityCriteria')
                .orderBy('qualityCriteria.id', 'DESC')
                .skip(skip)
                .take(limit);

            if (search) {
                queryBuilder.andWhere(
                    'qualityCriteria.criteriaName LIKE :search', { search: `%${search}%` }
                );
            }

            if (criteriaName) {
                queryBuilder.andWhere('qualityCriteria.criteriaName LIKE :criteriaName', { criteriaName: `%${criteriaName}%` });
            }

            if (criteriaType) {
                queryBuilder.andWhere('qualityCriteria.criteriaType LIKE :criteriaType', { criteriaType: `%${criteriaType}%` });
            }

            if (criteriaDescription) {
                queryBuilder.andWhere('qualityCriteria.criteriaDescription LIKE :criteriaDescription', { criteriaDescription: `%${criteriaDescription}%` });
            }

            const [qualityCriteria, total] = await queryBuilder.getManyAndCount();

            return { qualityCriteria, total, page, limit };
        } catch (error) {
            throw error;
        }
    }
}