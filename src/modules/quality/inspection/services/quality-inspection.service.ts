import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QualityInspection } from "../entities/quality-inspection.entity";
import { Production } from "@/modules/production/equipment-production/entities/production.entity";
import { CreateInspectionDto } from "../dto/create-inspection.dto";
import { UpdateInspectionDto } from "../dto/update-inspection.dto";
import { logService } from "@/modules/log/Services/log.service";

@Injectable()
export class QualityInspectionService {
    constructor(
        @InjectRepository(QualityInspection)
        private readonly inspectionRepository: Repository<QualityInspection>,
        @InjectRepository(Production)
        private readonly productionRepository: Repository<Production>,
        private readonly logService: logService,
    ) {}

    // 품질검사 코드 자동 생성
    private async generateInspectionCode(): Promise<string> {
        const count = await this.inspectionRepository
            .createQueryBuilder('inspection')
            .where('inspection.inspectionCode LIKE :pattern', { pattern: 'QI%' })
            .getCount();

        const sequence = (count + 1).toString().padStart(3, '0');
        return `QI${sequence}`;
    }

    // 생산완료 내역 조회 (품질검사 대상)
    async getProductionCompletions(
        page: number = 1,
        limit: number = 10,
        username: string = 'system',
        keyword?: string
    ) {
        try {
            const queryBuilder = this.productionRepository.createQueryBuilder('production')
                .leftJoin('production.qualityInspections', 'inspection')
                .where('production.productionStatus = :status', { status: '최종완료' })
                .andWhere('production.productionCompletionQuantity > 0')
                .andWhere('inspection.id IS NULL');

            if (keyword) {
                queryBuilder.andWhere(
                    '(production.productionCode LIKE :keyword OR production.productName LIKE :keyword)',
                    { keyword: `%${keyword}%` }
                );
            }

            const [productions, total] = await queryBuilder
                .orderBy('production.productionCompletionDate', 'DESC')
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            return {
                success: true,
                message: '생산완료 내역 조회 성공',
                data: {
                    productions,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            };
        } catch (error) {
            return {
                success: false,
                message: '생산완료 내역 조회 실패',
                error: error.message,
            };
        }
    }

    // 품질검사 등록
    async createInspection(createDto: CreateInspectionDto, username: string = 'system') {
        try {
            // 생산 정보 조회
            const production = await this.productionRepository.findOne({
                where: { id: createDto.productionId }
            });

            if (!production) {
                throw new NotFoundException('생산 정보를 찾을 수 없습니다.');
            }

            if (production.productionStatus !== '최종완료') {
                throw new BadRequestException('최종완료된 생산만 품질검사가 가능합니다.');
            }

            if (production.productionCompletionQuantity <= 0) {
                throw new BadRequestException('생산완료 수량이 없습니다.');
            }

            if (createDto.inspectionQuantity > production.productionCompletionQuantity) {
                throw new BadRequestException('검사 수량이 생산완료 수량을 초과할 수 없습니다.');
            }

            const inspectionCode = await this.generateInspectionCode();
            
            const newInspection = this.inspectionRepository.create({
                ...createDto,
                inspectionCode,
                productionCode: production.productionCode,
                productName: production.productName,
                inspectionStatus: 'PENDING',
                inspectionDate: new Date(createDto.inspectionDate),
                createdBy: username,
                updatedBy: username,
            });

            const savedInspection = await this.inspectionRepository.save(newInspection);

            await this.logService.createDetailedLog({
                moduleName: '품질검사 등록',
                action: 'CREATE_SUCCESS',
                username: username,
                targetId: savedInspection.id.toString(),
                targetName: savedInspection.inspectionCode,
                details: `생산코드: ${production.productionCode}, 검사수량: ${createDto.inspectionQuantity}`,
            });

            return {
                success: true,
                message: '품질검사 등록 성공',
                inspection: savedInspection,
            };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '품질검사 등록',
                action: 'CREATE_FAIL',
                username: username,
                targetId: createDto.productionId.toString(),
                targetName: '',
                details: '품질검사 등록 실패',
            });

            return {
                success: false,
                message: '품질검사 등록 실패',
                error: error.message,
            };
        }
    }

    // 품질검사 목록 조회
    async getInspections(
        page: number = 1,
        limit: number = 10,
        username: string = 'system',
        keyword?: string,
        status?: string,
        result?: string
    ) {
        try {
            const queryBuilder = this.inspectionRepository.createQueryBuilder('inspection')
                .leftJoinAndSelect('inspection.production', 'production');

            if (keyword) {
                queryBuilder.andWhere(
                    '(inspection.inspectionCode LIKE :keyword OR inspection.productionCode LIKE :keyword OR inspection.productName LIKE :keyword)',
                    { keyword: `%${keyword}%` }
                );
            }

            if (status) {
                queryBuilder.andWhere('inspection.inspectionStatus = :status', { status });
            }

            if (result) {
                queryBuilder.andWhere('inspection.inspectionResult = :result', { result });
            }

            const [inspections, total] = await queryBuilder
                .orderBy('inspection.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            return {
                success: true,
                message: '품질검사 목록 조회 성공',
                data: inspections,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            return {
                success: false,
                message: '품질검사 목록 조회 실패',
                error: error.message,
            };
        }
    }

    // 품질검사 상세 조회
    async getInspectionById(id: string) {
        try {
            const inspection = await this.inspectionRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['production']
            });

            if (!inspection) {
                throw new NotFoundException('품질검사를 찾을 수 없습니다.');
            }

            return {
                success: true,
                message: '품질검사 상세 조회 성공',
                inspection,
            };
        } catch (error) {
            return {
                success: false,
                message: '품질검사 상세 조회 실패',
                error: error.message,
            };
        }
    }

    // 품질검사 수정
    async updateInspection(id: string, updateDto: UpdateInspectionDto, username: string = 'system') {
        try {
            const inspection = await this.inspectionRepository.findOne({
                where: { id: parseInt(id) }
            });

            if (!inspection) {
                throw new NotFoundException('품질검사를 찾을 수 없습니다.');
            }

            if (inspection.inspectionStatus === 'COMPLETED') {
                throw new BadRequestException('완료된 검사는 수정할 수 없습니다.');
            }

            const updateData: Partial<QualityInspection> = {
                ...updateDto,
                inspectionDate: updateDto.inspectionDate ? new Date(updateDto.inspectionDate) : undefined,
                updatedBy: username,
            };

            await this.inspectionRepository.update(id, updateData);

            const updatedInspection = await this.inspectionRepository.findOne({
                where: { id: parseInt(id) }
            });

            if (!updatedInspection) {
                throw new NotFoundException('품질검사를 찾을 수 없습니다.');
            }

            await this.logService.createDetailedLog({
                moduleName: '품질검사 수정',
                action: 'UPDATE_SUCCESS',
                username: username,
                targetId: updatedInspection.id.toString(),
                targetName: updatedInspection.inspectionCode,
                details: '품질검사 수정 완료',
            });

            return {
                success: true,
                message: '품질검사 수정 성공',
                inspection: updatedInspection,
            };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '품질검사 수정',
                action: 'UPDATE_FAIL',
                username: username,
                targetId: id,
                targetName: '',
                details: '품질검사 수정 실패',
            });

            return {
                success: false,
                message: '품질검사 수정 실패',
                error: error.message,
            };
        }
    }

    // 품질검사 삭제
    async deleteInspection(id: string, username: string = 'system') {
        try {
            const inspection = await this.inspectionRepository.findOne({
                where: { id: parseInt(id) }
            });

            if (!inspection) {
                throw new NotFoundException('품질검사를 찾을 수 없습니다.');
            }

            if (inspection.inspectionStatus === 'COMPLETED') {
                throw new BadRequestException('완료된 검사는 삭제할 수 없습니다.');
            }

            await this.inspectionRepository.delete(id);

            await this.logService.createDetailedLog({
                moduleName: '품질검사 삭제',
                action: 'DELETE_SUCCESS',
                username: username,
                targetId: id,
                targetName: inspection.inspectionCode,
                details: '품질검사 삭제 완료',
            });

            return {
                success: true,
                message: '품질검사 삭제 성공',
            };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '품질검사 삭제',
                action: 'DELETE_FAIL',
                username: username,
                targetId: id,
                targetName: '',
                details: '품질검사 삭제 실패',
            });

            return {
                success: false,
                message: '품질검사 삭제 실패',
                error: error.message,
            };
        }
    }
}
