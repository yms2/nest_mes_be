import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from '../entities/claim.entity';
import { logService } from '../../../log/Services/log.service';

@Injectable()
export class ClaimDeleteService {
    constructor(
        @InjectRepository(Claim)
        private readonly claimRepository: Repository<Claim>,
        private readonly logService: logService,
    ) {}

    /**
     * 클레임을 삭제합니다
     */
    async deleteClaim(id: number, username: string = 'system') {
        try {
            // 기존 클레임 조회
            const existingClaim = await this.claimRepository.findOne({
                where: { id }
            });

            if (!existingClaim) {
                throw new NotFoundException(`ID ${id}에 해당하는 클레임을 찾을 수 없습니다.`);
            }

            // 삭제 가능 여부 확인 (완료된 클레임은 삭제 불가)
            if (existingClaim.claimStatus === '완료') {
                throw new BadRequestException('완료된 클레임은 삭제할 수 없습니다.');
            }

            // 삭제 실행
            await this.claimRepository.delete(id);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 삭제',
                action: 'DELETE_SUCCESS',
                username,
                targetId: existingClaim.claimCode,
                targetName: existingClaim.customerName,
                details: `클레임 삭제: ${existingClaim.claimCode} (고객: ${existingClaim.customerName}, 품목: ${existingClaim.productName})`
            });

            return {
                success: true,
                message: '클레임이 성공적으로 삭제되었습니다.',
                deletedClaim: {
                    id: existingClaim.id,
                    claimCode: existingClaim.claimCode,
                    customerName: existingClaim.customerName,
                    productName: existingClaim.productName,
                    claimStatus: existingClaim.claimStatus
                }
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 삭제',
                action: 'DELETE_FAILED',
                username,
                targetId: id.toString(),
                details: error.message
            });

            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`클레임 삭제 중 오류가 발생했습니다: ${error.message}`);
        }
    }
    /**
     * 여러 클레임을 일괄 삭제합니다
     */
    async deleteMultipleClaims(ids: number[], username: string = 'system') {
        try {
            const results = {
                success: [] as Array<{ id: number; claimCode: string; message: string }>,
                failed: [] as Array<{ id: number; error: string }>,
                total: ids.length
            };

            for (const id of ids) {
                try {
                    const result = await this.deleteClaim(id, username);
                    results.success.push({
                        id,
                        claimCode: result.deletedClaim.claimCode,
                        message: '삭제 성공'
                    });
                } catch (error) {
                    results.failed.push({
                        id,
                        error: error.message
                    });
                }
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 삭제',
                action: 'BULK_DELETE_SUCCESS',
                username,
                targetId: 'MULTIPLE',
                details: `일괄 삭제 완료: 성공 ${results.success.length}개, 실패 ${results.failed.length}개`
            });

            return {
                success: true,
                message: `일괄 삭제 완료: 성공 ${results.success.length}개, 실패 ${results.failed.length}개`,
                data: results
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 삭제',
                action: 'BULK_DELETE_FAILED',
                username,
                targetId: 'MULTIPLE',
                details: error.message
            });

            throw new BadRequestException(`일괄 삭제 중 오류가 발생했습니다: ${error.message}`);
        }
    }
}

