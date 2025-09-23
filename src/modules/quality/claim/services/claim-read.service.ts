import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from '../entities/claim.entity';
import { logService } from '../../../log/Services/log.service';

@Injectable()
export class ClaimReadService {
    constructor(
        @InjectRepository(Claim)
        private readonly claimRepository: Repository<Claim>,
        private readonly logService: logService,
    ) {}

    /**
     * 모든 클레임을 조회합니다 (페이징, 검색, 필터링 지원)
     */
    async getAllClaims(
        page: number = 1, 
        limit: number = 10, 
        search?: string, 
        claimStatus?: string,
        customerName?: string,
        productName?: string,
        projectName?: string,
        startDate?: string,
        endDate?: string,
        username: string = 'system'
    ) {
        try {
            const queryBuilder = this.claimRepository.createQueryBuilder('claim')
                .orderBy('claim.createdAt', 'DESC');

            // 검색 조건 (코드, 거래처명, 품목명, 프로젝트명, 클레임사유)
            if (search) {
                queryBuilder.andWhere(
                    '(claim.claimCode LIKE :search OR ' +
                    'claim.customerCode LIKE :search OR ' +
                    'claim.customerName LIKE :search OR ' +
                    'claim.projectCode LIKE :search OR ' +
                    'claim.projectName LIKE :search OR ' +
                    'claim.productCode LIKE :search OR ' +
                    'claim.productName LIKE :search OR ' +
                    'claim.claimReason LIKE :search)',
                    { search: `%${search}%` }
                );
            }

            // 클레임 상태 필터
            if (claimStatus) {
                queryBuilder.andWhere('claim.claimStatus = :claimStatus', { claimStatus });
            }


            // 고객명 필터
            if (customerName) {
                queryBuilder.andWhere('claim.customerName LIKE :customerName', { customerName: `%${customerName}%` });
            }

            // 품목명 필터
            if (productName) {
                queryBuilder.andWhere('claim.productName LIKE :productName', { productName: `%${productName}%` });
            }

            // 프로젝트명 필터
            if (projectName) {
                queryBuilder.andWhere('claim.projectName LIKE :projectName', { projectName: `%${projectName}%` });
            }

            // 날짜 범위 필터
            if (startDate) {
                queryBuilder.andWhere('claim.claimDate >= :startDate', { startDate });
            }
            if (endDate) {
                queryBuilder.andWhere('claim.claimDate <= :endDate', { endDate });
            }

            // 페이징 적용
            const [claims, total] = await queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            // 요약 정보 계산
            const allClaims = await this.claimRepository.find();
            const summary = {
                totalClaims: allClaims.length,
                totalQuantity: allClaims.reduce((sum, item) => sum + (item.claimQuantity || 0), 0),
                totalAmount: allClaims.reduce((sum, item) => sum + (item.claimPrice || 0), 0),
                byStatus: {
                    received: allClaims.filter(item => item.claimStatus === '접수').length,
                    processing: allClaims.filter(item => item.claimStatus === '처리중').length,
                    completed: allClaims.filter(item => item.claimStatus === '완료').length,
                    cancelled: allClaims.filter(item => item.claimStatus === '취소').length
                },
                uniqueCustomers: [...new Set(allClaims.map(item => item.customerCode))].length,
                uniqueProducts: [...new Set(allClaims.map(item => item.productCode))].length
            };

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 조회',
                action: 'READ_SUCCESS',
                username,
                targetId: 'ALL_CLAIMS',
                details: `클레임 목록 조회: 총 ${total}개 (검색: ${search || '없음'}, 상태: ${claimStatus || '전체'})`
            });

            return {
                success: true,
                data: {
                    claims,
                    summary,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 조회',
                action: 'READ_FAILED',
                username,
                targetId: 'ALL_CLAIMS',
                details: error.message
            });

            throw new BadRequestException(`클레임 조회 중 오류가 발생했습니다: ${error.message}`);
        }
    }
}
