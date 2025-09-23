import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from '../entities/claim.entity';
import { CreateClaimDto } from '../dto/create-claim.dto';
import { logService } from '../../../log/Services/log.service';

@Injectable()
export class ClaimCreateService {
    constructor(
        @InjectRepository(Claim)
        private readonly claimRepository: Repository<Claim>,
        private readonly logService: logService,
    ) {}

    /**
     * 새로운 클레임을 생성합니다
     */
    async createClaim(createClaimDto: CreateClaimDto, username: string = 'system') {
        try {
            // 클레임 코드 생성 (제공되지 않은 경우)
            let claimCode = createClaimDto.claimCode;
            if (!claimCode) {
                claimCode = await this.generateClaimCode();
            }

            // 클레임 정보 생성
            const claim = new Claim();
            claim.claimCode = claimCode;
            claim.claimDate = new Date(createClaimDto.claimDate);
            claim.customerCode = createClaimDto.customerCode;
            claim.customerName = createClaimDto.customerName;
            claim.projectCode = createClaimDto.projectCode;
            claim.projectName = createClaimDto.projectName;
            claim.productCode = createClaimDto.productCode;
            claim.productName = createClaimDto.productName;
            claim.claimQuantity = createClaimDto.claimQuantity;
            claim.claimPrice = createClaimDto.claimPrice;
            claim.claimReason = createClaimDto.claimReason;
            claim.claimStatus = '접수'; // 기본 상태는 접수
            claim.employeeCode = createClaimDto.employeeCode;
            claim.employeeName = createClaimDto.employeeName;
            claim.expectedCompletionDate = createClaimDto.expectedCompletionDate ? new Date(createClaimDto.expectedCompletionDate) : undefined;
            claim.remark = createClaimDto.remark || undefined;
            claim.createdBy = username;
            claim.updatedBy = username;

            // 저장
            const savedClaim = await this.claimRepository.save(claim);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 관리',
                action: 'CREATE_SUCCESS',
                username,
                targetId: savedClaim.claimCode,
                targetName: savedClaim.customerName,
                details: `클레임 생성: ${savedClaim.claimCode} (고객: ${savedClaim.customerName}, 품목: ${savedClaim.productName}, 금액: ${savedClaim.claimPrice.toLocaleString()}원)`
            });

            return {
                success: true,
                message: '클레임이 성공적으로 등록되었습니다.',
                data: savedClaim
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 관리',
                action: 'CREATE_FAILED',
                username,
                targetId: createClaimDto.claimCode || 'unknown',
                targetName: createClaimDto.customerName || 'unknown',
                details: error.message
            });

            if (error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException(`클레임 등록 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 클레임 코드를 자동 생성합니다
     */
    async generateClaimCode(): Promise<string> {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        const datePrefix = `CLM${year}${month}${day}`;
        
        // 해당 날짜의 마지막 순번 조회
        const lastClaim = await this.claimRepository
            .createQueryBuilder('claim')
            .where('claim.claimCode LIKE :pattern', { pattern: `${datePrefix}%` })
            .orderBy('claim.claimCode', 'DESC')
            .getOne();

        let sequence = 1;
        if (lastClaim) {
            const lastSequence = parseInt(lastClaim.claimCode.slice(-3));
            sequence = lastSequence + 1;
        }

        return `${datePrefix}${String(sequence).padStart(3, '0')}`;
    }

    /**
     * 클레임 코드 중복 확인
     */
    async checkClaimCodeExists(claimCode: string): Promise<boolean> {
        const existingClaim = await this.claimRepository.findOne({
            where: { claimCode }
        });
        return !!existingClaim;
    }

    /**
     * 클레임 생성 전 유효성 검사
     */
    async validateClaimData(createClaimDto: CreateClaimDto): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];
        
        // 금액 검사
        if (createClaimDto.claimPrice <= 0) {
            errors.push('클레임 금액은 0보다 커야 합니다.');
        }

        // 수량 검사
        if (createClaimDto.claimQuantity <= 0) {
            errors.push('클레임 수량은 0보다 커야 합니다.');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
