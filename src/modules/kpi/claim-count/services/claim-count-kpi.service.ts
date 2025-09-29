import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Claim } from '../../../quality/claim/entities/claim.entity';
import { ClaimCountKpiQueryDto, ClaimCountKpiResponseDto, ClaimCountKpiDetailResponseDto, ClaimDetailDto } from '../dto/claim-count-kpi.dto';

@Injectable()
export class ClaimCountKpiService {
    constructor(
        @InjectRepository(Claim)
        private readonly claimRepository: Repository<Claim>,
    ) {}

    /**
     * 월별 클레임 건수 KPI 조회
     */
    async getClaimCountKpi(queryDto: ClaimCountKpiQueryDto): Promise<ClaimCountKpiResponseDto[]> {
        const { yearMonth, startDate, endDate, customerCode, projectCode, claimStatus } = queryDto;

        // 날짜 범위 설정
        let dateCondition = {};
        if (yearMonth) {
            const year = parseInt(yearMonth.split('-')[0]);
            const month = parseInt(yearMonth.split('-')[1]);
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            dateCondition = Between(start, end);
        } else if (startDate && endDate) {
            dateCondition = Between(new Date(startDate), new Date(endDate));
        }

        // 쿼리 빌더 생성
        const queryBuilder = this.claimRepository.createQueryBuilder('claim')
            .select([
                'DATE_FORMAT(claim.claimDate, "%Y-%m") as yearMonth',
                'COUNT(*) as totalClaimCount',
                'SUM(CASE WHEN claim.claimStatus = "접수" THEN 1 ELSE 0 END) as receivedCount',
                'SUM(CASE WHEN claim.claimStatus = "처리중" THEN 1 ELSE 0 END) as processingCount',
                'SUM(CASE WHEN claim.claimStatus = "완료" THEN 1 ELSE 0 END) as completedCount',
                'SUM(CASE WHEN claim.claimStatus = "취소" THEN 1 ELSE 0 END) as cancelledCount',
                'SUM(claim.claimPrice) as totalClaimAmount'
            ])
            .where('1=1');

        // 날짜 조건 추가
        if (Object.keys(dateCondition).length > 0) {
            const startDateValue = yearMonth 
                ? new Date(parseInt(yearMonth.split('-')[0]), parseInt(yearMonth.split('-')[1]) - 1, 1) 
                : startDate ? new Date(startDate) : new Date();
            const endDateValue = yearMonth 
                ? new Date(parseInt(yearMonth.split('-')[0]), parseInt(yearMonth.split('-')[1]), 0, 23, 59, 59) 
                : endDate ? new Date(endDate) : new Date();
                
            queryBuilder.andWhere('claim.claimDate BETWEEN :startDate AND :endDate', {
                startDate: startDateValue,
                endDate: endDateValue
            });
        }

        // 추가 필터 조건
        if (customerCode) {
            queryBuilder.andWhere('claim.customerCode = :customerCode', { customerCode });
        }
        if (projectCode) {
            queryBuilder.andWhere('claim.projectCode = :projectCode', { projectCode });
        }
        if (claimStatus) {
            queryBuilder.andWhere('claim.claimStatus = :claimStatus', { claimStatus });
        }

        queryBuilder.groupBy('DATE_FORMAT(claim.claimDate, "%Y-%m")')
            .orderBy('yearMonth', 'DESC');

        const results = await queryBuilder.getRawMany();

        // 전월 대비 증감률 계산을 위해 이전 달 데이터도 조회
        const kpiResults: ClaimCountKpiResponseDto[] = [];

        for (const result of results) {
            const currentYearMonth = result.yearMonth;
            const [year, month] = currentYearMonth.split('-').map(Number);
            
            // 이전 달 계산
            const prevMonth = month === 1 ? 12 : month - 1;
            const prevYear = month === 1 ? year - 1 : year;
            const prevYearMonth = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;

            // 이전 달 데이터 조회
            const prevMonthData = await this.getClaimCountByMonth(prevYearMonth, customerCode, projectCode, claimStatus);
            
            // 전월 대비 증감률 계산
            const monthOverMonthChange = prevMonthData.totalClaimCount > 0 
                ? ((result.totalClaimCount - prevMonthData.totalClaimCount) / prevMonthData.totalClaimCount) * 100
                : 0;

            // 일평균 클레임 건수 계산
            const daysInMonth = new Date(year, month, 0).getDate();
            const dailyAverageCount = result.totalClaimCount / daysInMonth;

            kpiResults.push({
                yearMonth: currentYearMonth,
                totalClaimCount: parseInt(result.totalClaimCount),
                receivedCount: parseInt(result.receivedCount),
                processingCount: parseInt(result.processingCount),
                completedCount: parseInt(result.completedCount),
                cancelledCount: parseInt(result.cancelledCount),
                totalClaimAmount: parseFloat(result.totalClaimAmount) || 0,
                monthOverMonthChange: Math.round(monthOverMonthChange * 100) / 100,
                dailyAverageCount: Math.round(dailyAverageCount * 100) / 100
            });
        }

        return kpiResults;
    }

    /**
     * 월별 클레임 건수 KPI 상세 조회 (클레임 목록 포함)
     */
    async getClaimCountKpiDetail(queryDto: ClaimCountKpiQueryDto): Promise<ClaimCountKpiDetailResponseDto[]> {
        const kpiResults = await this.getClaimCountKpi(queryDto);
        const detailResults: ClaimCountKpiDetailResponseDto[] = [];

        for (const kpi of kpiResults) {
            // 해당 월의 클레임 상세 목록 조회
            const [year, month] = kpi.yearMonth.split('-').map(Number);
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);

            const claimDetails = await this.claimRepository.find({
                where: {
                    claimDate: Between(start, end),
                    ...(queryDto.customerCode && { customerCode: queryDto.customerCode }),
                    ...(queryDto.projectCode && { projectCode: queryDto.projectCode }),
                    ...(queryDto.claimStatus && { claimStatus: queryDto.claimStatus })
                },
                order: { claimDate: 'DESC' }
            });

            const claimDetailDtos: ClaimDetailDto[] = claimDetails.map(claim => ({
                claimCode: claim.claimCode,
                claimDate: claim.claimDate,
                customerCode: claim.customerCode,
                customerName: claim.customerName,
                projectCode: claim.projectCode,
                projectName: claim.projectName,
                productCode: claim.productCode,
                productName: claim.productName,
                claimQuantity: claim.claimQuantity,
                claimPrice: claim.claimPrice,
                claimReason: claim.claimReason,
                claimStatus: claim.claimStatus,
                employeeName: claim.employeeName,
                completionDate: claim.completionDate
            }));

            detailResults.push({
                ...kpi,
                claimDetails: claimDetailDtos
            });
        }

        return detailResults;
    }

    /**
     * 특정 월의 클레임 건수 조회 (내부 메서드)
     */
    private async getClaimCountByMonth(
        yearMonth: string, 
        customerCode?: string, 
        projectCode?: string, 
        claimStatus?: string
    ): Promise<{ totalClaimCount: number }> {
        const [year, month] = yearMonth.split('-').map(Number);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const queryBuilder = this.claimRepository.createQueryBuilder('claim')
            .select('COUNT(*) as totalClaimCount')
            .where('claim.claimDate BETWEEN :startDate AND :endDate', { startDate: start, endDate: end });

        if (customerCode) {
            queryBuilder.andWhere('claim.customerCode = :customerCode', { customerCode });
        }
        if (projectCode) {
            queryBuilder.andWhere('claim.projectCode = :projectCode', { projectCode });
        }
        if (claimStatus) {
            queryBuilder.andWhere('claim.claimStatus = :claimStatus', { claimStatus });
        }

        const result = await queryBuilder.getRawOne();
        return { totalClaimCount: parseInt(result?.totalClaimCount) || 0 };
    }

    /**
     * 클레임 건수 통계 요약 조회
     */
    async getClaimCountSummary(queryDto: ClaimCountKpiQueryDto): Promise<{
        totalClaims: number;
        totalAmount: number;
        averagePerMonth: number;
        topCustomer: { customerName: string; claimCount: number }[];
        topProject: { projectName: string; claimCount: number }[];
    }> {
        const { startDate, endDate, customerCode, projectCode, claimStatus } = queryDto;

        // 전체 통계
        const totalStats = await this.claimRepository.createQueryBuilder('claim')
            .select([
                'COUNT(*) as totalClaims',
                'SUM(claim.claimPrice) as totalAmount'
            ])
            .where('1=1')
            .andWhere(startDate ? 'claim.claimDate >= :startDate' : '1=1', startDate ? { startDate: new Date(startDate) } : {})
            .andWhere(endDate ? 'claim.claimDate <= :endDate' : '1=1', endDate ? { endDate: new Date(endDate) } : {})
            .andWhere(customerCode ? 'claim.customerCode = :customerCode' : '1=1', customerCode ? { customerCode } : {})
            .andWhere(projectCode ? 'claim.projectCode = :projectCode' : '1=1', projectCode ? { projectCode } : {})
            .andWhere(claimStatus ? 'claim.claimStatus = :claimStatus' : '1=1', claimStatus ? { claimStatus } : {})
            .getRawOne();

        // 월평균 계산
        const monthlyData = await this.getClaimCountKpi(queryDto);
        const averagePerMonth = monthlyData.length > 0 
            ? monthlyData.reduce((sum, data) => sum + data.totalClaimCount, 0) / monthlyData.length 
            : 0;

        // 상위 고객사
        const topCustomers = await this.claimRepository.createQueryBuilder('claim')
            .select([
                'claim.customerName as customerName',
                'COUNT(*) as claimCount'
            ])
            .where('1=1')
            .andWhere(startDate ? 'claim.claimDate >= :startDate' : '1=1', startDate ? { startDate: new Date(startDate) } : {})
            .andWhere(endDate ? 'claim.claimDate <= :endDate' : '1=1', endDate ? { endDate: new Date(endDate) } : {})
            .andWhere(customerCode ? 'claim.customerCode = :customerCode' : '1=1', customerCode ? { customerCode } : {})
            .andWhere(projectCode ? 'claim.projectCode = :projectCode' : '1=1', projectCode ? { projectCode } : {})
            .andWhere(claimStatus ? 'claim.claimStatus = :claimStatus' : '1=1', claimStatus ? { claimStatus } : {})
            .groupBy('claim.customerName')
            .orderBy('claimCount', 'DESC')
            .limit(5)
            .getRawMany();

        // 상위 프로젝트
        const topProjects = await this.claimRepository.createQueryBuilder('claim')
            .select([
                'claim.projectName as projectName',
                'COUNT(*) as claimCount'
            ])
            .where('1=1')
            .andWhere(startDate ? 'claim.claimDate >= :startDate' : '1=1', startDate ? { startDate: new Date(startDate) } : {})
            .andWhere(endDate ? 'claim.claimDate <= :endDate' : '1=1', endDate ? { endDate: new Date(endDate) } : {})
            .andWhere(customerCode ? 'claim.customerCode = :customerCode' : '1=1', customerCode ? { customerCode } : {})
            .andWhere(projectCode ? 'claim.projectCode = :projectCode' : '1=1', projectCode ? { projectCode } : {})
            .andWhere(claimStatus ? 'claim.claimStatus = :claimStatus' : '1=1', claimStatus ? { claimStatus } : {})
            .groupBy('claim.projectName')
            .orderBy('claimCount', 'DESC')
            .limit(5)
            .getRawMany();

        return {
            totalClaims: parseInt(totalStats?.totalClaims) || 0,
            totalAmount: parseFloat(totalStats?.totalAmount) || 0,
            averagePerMonth: Math.round(averagePerMonth * 100) / 100,
            topCustomer: topCustomers.map(c => ({
                customerName: c.customerName,
                claimCount: parseInt(c.claimCount)
            })),
            topProject: topProjects.map(p => ({
                projectName: p.projectName,
                claimCount: parseInt(p.claimCount)
            }))
        };
    }
}
