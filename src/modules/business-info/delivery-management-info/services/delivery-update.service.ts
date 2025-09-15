import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from '../entities/delivery.entity';
import { UpdateDeliveryDto } from '../dto/update-delivery.dto';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class DeliveryUpdateService {
    constructor(
        @InjectRepository(Delivery)
        private readonly deliveryRepository: Repository<Delivery>,
        private readonly logService: logService,
    ) {}

    /**
     * 납품 정보 수정
     * @param deliveryCode 납품 코드
     * @param updateDeliveryDto 수정할 납품 정보
     * @param username 수정자
     * @returns 수정된 납품 정보
     */
    async updateDelivery(
        deliveryCode: string,
        updateDeliveryDto: UpdateDeliveryDto,
        username: string
    ): Promise<Delivery> {
        try {
            // 기존 납품 정보 조회
            const existingDelivery = await this.deliveryRepository.findOne({
                where: { deliveryCode }
            });

            if (!existingDelivery) {
                throw new NotFoundException(`납품 코드 ${deliveryCode}에 해당하는 납품을 찾을 수 없습니다.`);
            }

            // 수정할 데이터 준비
            const updateData: any = {
                ...updateDeliveryDto,
                updatedBy: username,
                updatedAt: new Date(),
            };

            // 날짜 필드 처리
            if (updateDeliveryDto.deliveryDate) {
                updateData.deliveryDate = new Date(updateDeliveryDto.deliveryDate);
            }

            // 납품 정보 업데이트
            await this.deliveryRepository.update(
                { deliveryCode },
                updateData
            );

            // 업데이트된 납품 정보 조회
            const updatedDelivery = await this.deliveryRepository.findOne({
                where: { deliveryCode }
            });

            if (!updatedDelivery) {
                throw new NotFoundException(`업데이트된 납품 정보를 찾을 수 없습니다.`);
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_UPDATE',
                action: `납품 정보 수정: ${deliveryCode}`,
                username,
                targetId: deliveryCode,
                details: `수정된 필드: ${Object.keys(updateDeliveryDto).join(', ')}`
            });

            return updatedDelivery;
        } catch (error) {
            // 오류 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_UPDATE_ERROR',
                action: `납품 정보 수정 실패: ${deliveryCode}`,
                username,
                targetId: deliveryCode,
                details: `오류: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * 납품 삭제 (소프트 삭제)
     * @param deliveryCode 납품 코드
     * @param username 삭제자
     * @returns 삭제 성공 여부
     */
    async deleteDelivery(deliveryCode: string, username: string): Promise<void> {
        try {
            // 기존 납품 정보 조회
            const existingDelivery = await this.deliveryRepository.findOne({
                where: { 
                    deliveryCode,
                    deletedAt: null
                } as any
            });

            if (!existingDelivery) {
                throw new NotFoundException(`납품 코드 ${deliveryCode}에 해당하는 납품을 찾을 수 없습니다.`);
            }

            // 소프트 삭제 실행
            await this.deliveryRepository.update(
                { deliveryCode },
                {
                    deletedAt: new Date(),
                    updatedBy: username,
                    updatedAt: new Date()
                }
            );

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_DELETE',
                action: `납품 삭제: ${deliveryCode}`,
                username,
                targetId: deliveryCode,
                details: `납품이 소프트 삭제되었습니다.`
            });

        } catch (error) {
            // 오류 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_DELETE_ERROR',
                action: `납품 삭제 실패: ${deliveryCode}`,
                username,
                targetId: deliveryCode,
                details: `오류: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * 납품 삭제 (ID로, 소프트 삭제)
     * @param id 납품 ID
     * @param username 삭제자
     * @returns 삭제 성공 여부
     */
    async deleteDeliveryById(id: number, username: string): Promise<void> {
        try {
            // 기존 납품 정보 조회
            const existingDelivery = await this.deliveryRepository.findOne({
                where: { 
                    id,
                    deletedAt: null
                } as any
            });

            if (!existingDelivery) {
                throw new NotFoundException(`ID ${id}에 해당하는 납품을 찾을 수 없습니다.`);
            }

            // 소프트 삭제 실행
            await this.deliveryRepository.update(
                { id },
                {
                    deletedAt: new Date(),
                    updatedBy: username,
                    updatedAt: new Date()
                }
            );

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_DELETE',
                action: `납품 삭제: ID ${id} (${existingDelivery.deliveryCode})`,
                username,
                targetId: existingDelivery.deliveryCode,
                details: `납품이 소프트 삭제되었습니다.`
            });

        } catch (error) {
            // 오류 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_DELETE_ERROR',
                action: `납품 삭제 실패: ID ${id}`,
                username,
                targetId: id.toString(),
                details: `오류: ${error.message}`
            });

            throw error;
        }
    }

}
