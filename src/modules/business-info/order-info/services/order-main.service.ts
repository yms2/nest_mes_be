import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderMain } from '../entities/order-main.entity';
import { OrderInfo } from '../entities/order-info.entity';
import { CreateOrderMainDto } from '../dto/create-order-main.dto';
import { UpdateOrderMainDto } from '../dto/update-order-main.dto';
import { logService } from '../../../log/Services/log.service';

@Injectable()
export class OrderMainService {
    constructor(
        @InjectRepository(OrderMain)
        private readonly orderMainRepository: Repository<OrderMain>,
        @InjectRepository(OrderInfo)
        private readonly orderInfoRepository: Repository<OrderInfo>,
        private readonly logService: logService,
    ) {}

    /**
     * 수주 메인 정보를 생성합니다.
     */
    async createOrderMain(createOrderMainDto: CreateOrderMainDto, username: string = 'system') {
        try {
            // 중복 수주 코드 확인
            const existingOrder = await this.orderMainRepository.findOne({
                where: { orderCode: createOrderMainDto.orderCode }
            });

            if (existingOrder) {
                throw new BadRequestException(`수주 코드 '${createOrderMainDto.orderCode}'는 이미 존재합니다.`);
            }

            // 수주 메인 정보 생성
            const orderMain = this.orderMainRepository.create({
                ...createOrderMainDto,
                remark: createOrderMainDto.remark || '',
                approvalInfo: createOrderMainDto.approvalInfo || ''
            });

            // 저장
            const savedOrderMain = await this.orderMainRepository.save(orderMain);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '수주 메인 관리',
                action: 'CREATE_SUCCESS',
                username,
                targetId: savedOrderMain.orderCode,
                details: `수주 메인 정보 생성: ${savedOrderMain.orderCode} (발주비고: ${savedOrderMain.remark}, 승인정보: ${savedOrderMain.approvalInfo})`
            });

            return {
                success: true,
                message: '수주 메인 정보가 성공적으로 등록되었습니다.',
                orderMain: savedOrderMain
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '수주 메인 관리',
                action: 'CREATE_FAILED',
                username,
                targetId: createOrderMainDto.orderCode,
                details: error.message
            });

            throw error;
        }
    }

    /**
     * 모든 수주 메인 정보를 조회합니다. (수주 디테일 데이터 포함)
     */
    async getAllOrderMains(page: number = 1, limit: number = 10, search?: string) {
        try {
            const queryBuilder = this.orderMainRepository.createQueryBuilder('orderMain');

            // 검색 조건
            if (search) {
                queryBuilder.where(
                    'orderMain.orderCode LIKE :search OR orderMain.remark LIKE :search OR orderMain.approvalInfo LIKE :search',
                    { search: `%${search}%` }
                );
            }

            // 정렬 및 페이징
            const [orderMains, total] = await queryBuilder
                .orderBy('orderMain.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            // 각 수주 메인에 대한 디테일 정보 조회
            const orderMainsWithDetails = await Promise.all(
                orderMains.map(async (orderMain) => {
                    // 해당 수주 코드로 시작하는 모든 발주 디테일 정보 조회 (LIKE 패턴 사용)
                    const orderDetails = await this.orderInfoRepository
                        .createQueryBuilder('orderInfo')
                        .where('orderInfo.orderCode LIKE :orderCodePattern', { 
                            orderCodePattern: `${orderMain.orderCode}_%` 
                        })
                        .orderBy('orderInfo.createdAt', 'DESC')
                        .getMany();

                    // 발주 디테일 요약 정보 계산
                    const summary = {
                        totalItems: orderDetails.length,
                        totalQuantity: orderDetails.reduce((sum, item) => sum + (item.orderQuantity || 0), 0),
                        totalAmount: orderDetails.reduce((sum, item) => sum + (item.total || 0), 0),
                        totalSupplyPrice: orderDetails.reduce((sum, item) => sum + (item.supplyPrice || 0), 0),
                        totalVat: orderDetails.reduce((sum, item) => sum + (item.vat || 0), 0),
                        uniqueProducts: [...new Set(orderDetails.map(item => item.productCode))].length
                    };

                    return {
                        ...orderMain,
                        orderDetails,
                        summary
                    };
                })
            );

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '수주 메인 관리',
                action: 'READ_SUCCESS',
                username: 'system',
                targetId: 'ALL_MAIN_WITH_DETAILS',
                details: `수주 메인 정보 목록 조회 (디테일 포함): 총 ${total}개 (검색: ${search || '없음'})`
            });

            return {
                success: true,
                data: orderMainsWithDetails,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '수주 메인 관리',
                action: 'READ_FAILED',
                username: 'system',
                targetId: 'ALL_MAIN_WITH_DETAILS',
                details: error.message
            });

            throw new BadRequestException(`수주 메인 정보 조회 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * ID로 수주 메인 정보를 조회합니다.
     */
    async getOrderMainById(id: number) {
        try {
            const orderMain = await this.orderMainRepository.findOne({
                where: { id }
            });

            if (!orderMain) {
                throw new NotFoundException(`ID ${id}에 해당하는 수주 메인 정보를 찾을 수 없습니다.`);
            }

            return {
                success: true,
                data: orderMain
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`수주 메인 정보 조회 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 수주 코드로 수주 메인 정보를 조회합니다.
     */
    async getOrderMainByCode(orderCode: string) {
        try {
            const orderMain = await this.orderMainRepository.findOne({
                where: { orderCode }
            });

            if (!orderMain) {
                throw new NotFoundException(`수주 코드 '${orderCode}'에 해당하는 수주 메인 정보를 찾을 수 없습니다.`);
            }

            return {
                success: true,
                data: orderMain
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`수주 메인 정보 조회 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 수주 코드로 수주 디테일 정보를 조회합니다.
     */
    async getOrderDetailByCode(orderCode: string, page: number = 1, limit: number = 50) {
        try {
            // 1. 수주 메인 정보 조회
            const orderMain = await this.orderMainRepository.findOne({
                where: { orderCode }
            });

            if (!orderMain) {
                throw new NotFoundException(`수주 코드 '${orderCode}'에 해당하는 수주 메인 정보를 찾을 수 없습니다.`);
            }

            // 2. 해당 수주 코드로 시작하는 모든 발주 디테일 정보 조회
            const queryBuilder = this.orderInfoRepository.createQueryBuilder('orderInfo')
                .where('orderInfo.orderCode LIKE :orderCodePattern', { orderCodePattern: `${orderCode}_%` })
                .orderBy('orderInfo.createdAt', 'DESC');

            // 3. 페이징 적용
            const [orderDetails, total] = await queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            // 4. 발주 디테일 정보 요약 계산
            const summary = {
                totalItems: total,
                totalQuantity: orderDetails.reduce((sum, item) => sum + (item.orderQuantity || 0), 0),
                totalAmount: orderDetails.reduce((sum, item) => sum + (item.total || 0), 0),
                totalSupplyPrice: orderDetails.reduce((sum, item) => sum + (item.supplyPrice || 0), 0),
                totalVat: orderDetails.reduce((sum, item) => sum + (item.vat || 0), 0),
                uniqueProducts: [...new Set(orderDetails.map(item => item.productCode))].length
            };

            // 5. 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '수주 메인 관리',
                action: 'READ_SUCCESS',
                username: 'system',
                targetId: orderCode,
                details: `수주 디테일 정보 조회: ${orderCode} (총 ${total}개 아이템)`
            });

            return {
                success: true,
                data: {
                    orderMain,
                    orderDetails,
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
                moduleName: '수주 메인 관리',
                action: 'READ_FAILED',
                username: 'system',
                targetId: orderCode,
                details: error.message
            });

            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`수주 디테일 정보 조회 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 전체 발주 디테일 정보를 조회합니다.
     */
    async getAllOrderDetails(page: number = 1, limit: number = 50, search?: string) {
        try {
            const queryBuilder = this.orderInfoRepository.createQueryBuilder('orderInfo')
                .orderBy('orderInfo.createdAt', 'DESC');

            // 검색 조건
            if (search) {
                queryBuilder.where(
                    'orderInfo.orderCode LIKE :search OR orderInfo.projectCode LIKE :search OR orderInfo.projectName LIKE :search OR orderInfo.productCode LIKE :search OR orderInfo.productName LIKE :search OR orderInfo.customerCode LIKE :search OR orderInfo.customerName LIKE :search',
                    { search: `%${search}%` }
                );
            }

            // 페이징 적용
            const [orderDetails, total] = await queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            // 전체 요약 정보 계산
            const allOrderDetails = await this.orderInfoRepository.find();
            const summary = {
                totalItems: allOrderDetails.length,
                totalQuantity: allOrderDetails.reduce((sum, item) => sum + (item.orderQuantity || 0), 0),
                totalAmount: allOrderDetails.reduce((sum, item) => sum + (item.total || 0), 0),
                totalSupplyPrice: allOrderDetails.reduce((sum, item) => sum + (item.supplyPrice || 0), 0),
                totalVat: allOrderDetails.reduce((sum, item) => sum + (item.vat || 0), 0),
                uniqueProducts: [...new Set(allOrderDetails.map(item => item.productCode))].length,
                uniqueOrders: [...new Set(allOrderDetails.map(item => item.orderCode.split('_')[0]))].length,
                uniqueCustomers: [...new Set(allOrderDetails.map(item => item.customerCode))].length
            };

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '수주 메인 관리',
                action: 'READ_SUCCESS',
                username: 'system',
                targetId: 'ALL',
                details: `전체 발주 디테일 정보 조회: 총 ${total}개 아이템 (검색: ${search || '없음'})`
            });

            return {
                success: true,
                data: {
                    orderDetails,
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
                moduleName: '수주 메인 관리',
                action: 'READ_FAILED',
                username: 'system',
                targetId: 'ALL',
                details: error.message
            });

            throw new BadRequestException(`전체 발주 디테일 정보 조회 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 수주 메인 정보를 수정합니다.
     */
    async updateOrderMain(id: number, updateOrderMainDto: UpdateOrderMainDto, username: string = 'system') {
        try {
            // 기존 정보 조회
            const existingOrderMain = await this.orderMainRepository.findOne({
                where: { id }
            });

            if (!existingOrderMain) {
                throw new NotFoundException(`ID ${id}에 해당하는 수주 메인 정보를 찾을 수 없습니다.`);
            }

            // 수주 코드 중복 확인 (다른 ID와 중복되는지)
            if (updateOrderMainDto.orderCode && updateOrderMainDto.orderCode !== existingOrderMain.orderCode) {
                const duplicateOrder = await this.orderMainRepository.findOne({
                    where: { orderCode: updateOrderMainDto.orderCode }
                });

                if (duplicateOrder) {
                    throw new BadRequestException(`수주 코드 '${updateOrderMainDto.orderCode}'는 이미 다른 수주에서 사용 중입니다.`);
                }
            }

            // 업데이트 실행
            await this.orderMainRepository.update(id, updateOrderMainDto);

            // 업데이트된 정보 조회
            const updatedOrderMain = await this.orderMainRepository.findOne({
                where: { id }
            });

            if (!updatedOrderMain) {
                throw new NotFoundException(`ID ${id}에 해당하는 수주 메인 정보를 찾을 수 없습니다.`);
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '수주 메인 관리',
                action: 'UPDATE_SUCCESS',
                username,
                targetId: updatedOrderMain.orderCode,
                details: `수주 메인 정보 수정: ${updatedOrderMain.orderCode} (발주비고: ${updatedOrderMain.remark}, 승인정보: ${updatedOrderMain.approvalInfo})`
            });


            return {
                success: true,
                message: '수주 메인 정보가 성공적으로 수정되었습니다.',
                orderMain: updatedOrderMain
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '수주 메인 관리',
                action: 'UPDATE_FAILED',
                username,
                targetId: id.toString(),
                details: error.message
            });

            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`수주 메인 정보 수정 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 수주 메인 정보를 삭제합니다.
     */
    async deleteOrderMain(id: number, username: string = 'system') {
        try {
            // 기존 정보 조회
            const existingOrderMain = await this.orderMainRepository.findOne({
                where: { id }
            });

            if (!existingOrderMain) {
                throw new NotFoundException(`ID ${id}에 해당하는 수주 메인 정보를 찾을 수 없습니다.`);
            }

            // 삭제 실행
            await this.orderMainRepository.delete(id);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '수주 메인 관리',
                action: 'DELETE_SUCCESS',
                username,
                targetId: existingOrderMain.orderCode,
                details: `수주 메인 정보 삭제: ${existingOrderMain.orderCode} (발주비고: ${existingOrderMain.remark}, 승인정보: ${existingOrderMain.approvalInfo})`
            });

            return {
                success: true,
                message: '수주 메인 정보가 성공적으로 삭제되었습니다.',
                deletedOrderMain: existingOrderMain
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '수주 메인 관리',
                action: 'DELETE_FAILED',
                username,
                targetId: id.toString(),
                details: error.message
            });

            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`수주 메인 정보 삭제 중 오류가 발생했습니다: ${error.message}`);
        }
    }

}
