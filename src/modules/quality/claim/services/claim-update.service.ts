import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from '../entities/claim.entity';
import { UpdateClaimDto } from '../dto/update-claim.dto';
import { logService } from '../../../log/Services/log.service';

@Injectable()
export class ClaimUpdateService {
    constructor(
        @InjectRepository(Claim)
        private readonly claimRepository: Repository<Claim>,
        private readonly logService: logService,
    ) {}

    /**
     * 클레임을 수정합니다
     */
    async updateClaim(id: number, updateClaimDto: UpdateClaimDto, username: string = 'system') {
        try {
            // 기존 클레임 조회
            const existingClaim = await this.claimRepository.findOne({
                where: { id }
            });

            if (!existingClaim) {
                throw new NotFoundException(`ID ${id}에 해당하는 클레임을 찾을 수 없습니다.`);
            }

            // 수정 데이터 준비
            const updateData: any = { ...updateClaimDto };
            
            // 날짜 필드 처리
            if (updateClaimDto.claimDate) {
                updateData.claimDate = new Date(updateClaimDto.claimDate);
            }
            if (updateClaimDto.completionDate) {
                updateData.completionDate = new Date(updateClaimDto.completionDate);
            }
            if (updateClaimDto.expectedCompletionDate) {
                updateData.expectedCompletionDate = new Date(updateClaimDto.expectedCompletionDate);
            }

            // updatedBy 설정
            updateData.updatedBy = username;

            // 업데이트 실행
            await this.claimRepository.update(id, updateData);

            // 업데이트된 클레임 조회
            const updatedClaim = await this.claimRepository.findOne({
                where: { id }
            });

            if (!updatedClaim) {
                throw new NotFoundException(`ID ${id}에 해당하는 클레임을 찾을 수 없습니다.`);
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 수정',
                action: 'UPDATE_SUCCESS',
                username,
                targetId: updatedClaim.claimCode,
                targetName: updatedClaim.customerName,
                details: `클레임 수정: ${updatedClaim.claimCode} (고객: ${updatedClaim.customerName}, 상태: ${updatedClaim.claimStatus})`
            });

            return {
                success: true,
                message: '클레임이 성공적으로 수정되었습니다.',
                data: updatedClaim
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 수정',
                action: 'UPDATE_FAILED',
                username,
                targetId: id.toString(),
                details: error.message
            });

            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`클레임 수정 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 클레임 상태를 변경합니다
     */
    async updateClaimStatus(id: number, status: string, username: string = 'system') {
        try {
            // 기존 클레임 조회
            const existingClaim = await this.claimRepository.findOne({
                where: { id }
            });

            if (!existingClaim) {
                throw new NotFoundException(`ID ${id}에 해당하는 클레임을 찾을 수 없습니다.`);
            }

            // 유효한 상태인지 확인
            const validStatuses = ['접수', '처리중', '완료', '취소'];
            if (!validStatuses.includes(status)) {
                throw new BadRequestException(`유효하지 않은 상태입니다. 가능한 상태: ${validStatuses.join(', ')}`);
            }

            // 상태 변경
            await this.claimRepository.update(id, {
                claimStatus: status,
                updatedBy: username
            });

            // 완료 상태로 변경 시 완료일 설정
            if (status === '완료') {
                await this.claimRepository.update(id, {
                    completionDate: new Date(),
                    updatedBy: username
                });
            }

            // 업데이트된 클레임 조회
            const updatedClaim = await this.claimRepository.findOne({
                where: { id }
            });

            if (!updatedClaim) {
                throw new NotFoundException(`ID ${id}에 해당하는 클레임을 찾을 수 없습니다.`);
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 수정',
                action: 'STATUS_UPDATE_SUCCESS',
                username,
                targetId: updatedClaim.claimCode,
                targetName: updatedClaim.customerName,
                details: `클레임 상태 변경: ${updatedClaim.claimCode} (${existingClaim.claimStatus} → ${status})`
            });

            return {
                success: true,
                message: `클레임 상태가 '${status}'로 변경되었습니다.`,
                data: updatedClaim
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 수정',
                action: 'STATUS_UPDATE_FAILED',
                username,
                targetId: id.toString(),
                details: error.message
            });

            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`클레임 상태 변경 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 클레임 처리 결과를 업데이트합니다
     */
    async updateClaimResolution(id: number, resolution: string, username: string = 'system') {
        try {
            // 기존 클레임 조회
            const existingClaim = await this.claimRepository.findOne({
                where: { id }
            });

            if (!existingClaim) {
                throw new NotFoundException(`ID ${id}에 해당하는 클레임을 찾을 수 없습니다.`);
            }

            // 처리 결과 업데이트
            await this.claimRepository.update(id, {
                resolution,
                updatedBy: username
            });

            // 업데이트된 클레임 조회
            const updatedClaim = await this.claimRepository.findOne({
                where: { id }
            });

            if (!updatedClaim) {
                throw new NotFoundException(`ID ${id}에 해당하는 클레임을 찾을 수 없습니다.`);
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 수정',
                action: 'RESOLUTION_UPDATE_SUCCESS',
                username,
                targetId: updatedClaim.claimCode,
                targetName: updatedClaim.customerName,
                details: `클레임 처리결과 업데이트: ${updatedClaim.claimCode} - ${resolution}`
            });

            return {
                success: true,
                message: '클레임 처리 결과가 업데이트되었습니다.',
                data: updatedClaim
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'AS 클레임 수정',
                action: 'RESOLUTION_UPDATE_FAILED',
                username,
                targetId: id.toString(),
                details: error.message
            });

            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`클레임 처리 결과 업데이트 중 오류가 발생했습니다: ${error.message}`);
        }
    }
}
