import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { InventoryIssue } from '../entities/inventory-issue.entity';
import { CreateInventoryIssueDto } from '../dto/create-inventory-issue.dto';
import { Inventory } from '../../inventory-management/entities/inventory.entity';
import { InventoryManagementService } from '../../inventory-management/services/inventory-management.service';
import { ChangeQuantityDto } from '../../inventory-management/dto/quantity-change.dto';
import { logService } from '../../../log/Services/log.service';

@Injectable()
export class InventoryIssueService {
    constructor(
        @InjectRepository(InventoryIssue)
        private readonly inventoryIssueRepository: Repository<InventoryIssue>,
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
        private readonly inventoryManagementService: InventoryManagementService,
        private readonly logService: logService,
    ) {}

    /**
     * 불출 정보를 생성합니다.
     */
    async createInventoryIssue(createInventoryIssueDto: CreateInventoryIssueDto, username: string = 'system') {
        try {
            // 불출 코드 자동 생성
            const lastIssue = await this.inventoryIssueRepository
                .createQueryBuilder('issue')
                .orderBy('issue.createdAt', 'DESC')
                .getOne();
            
            let nextCode = 'ISS001';
            if (lastIssue && lastIssue.issueCode) {
                const lastNumber = parseInt(lastIssue.issueCode.replace('ISS', ''));
                nextCode = `ISS${String(lastNumber + 1).padStart(3, '0')}`;
            }

            // 불출 정보 생성
            const inventoryIssue = this.inventoryIssueRepository.create({
                issueCode: createInventoryIssueDto.issueCode || nextCode,
                issueDate: createInventoryIssueDto.issueDate ? new Date(createInventoryIssueDto.issueDate) : new Date(),
                productCode: createInventoryIssueDto.productCode || '',
                productName: createInventoryIssueDto.productName || '',
                unit: createInventoryIssueDto.unit || 'EA',
                issueQuantity: createInventoryIssueDto.issueQuantity || 0,
                warehouseCode: createInventoryIssueDto.warehouseCode || '',
                warehouseName: createInventoryIssueDto.warehouseName || '',
                lotCode: createInventoryIssueDto.lotCode || '',
                employeeCode: createInventoryIssueDto.employeeCode || '',
                employeeName: createInventoryIssueDto.employeeName || '',
                projectCode: createInventoryIssueDto.projectCode || '',
                projectName: createInventoryIssueDto.projectName || '',
                issueReason: createInventoryIssueDto.issueReason || '',
                remark: createInventoryIssueDto.remark || '',
                approvalStatus: createInventoryIssueDto.approvalStatus || '대기',
                createdBy: username,
                updatedBy: username,
            });

            // 저장
            const savedIssue = await this.inventoryIssueRepository.save(inventoryIssue);

            // 재고 수량 감소 처리 (불출 등록 시 바로 차감)
            if (savedIssue.productCode && savedIssue.issueQuantity > 0) {
                try {
                    // 재고 차감 전 현재 수량 조회
                    const currentInventory = await this.inventoryRepository.findOne({
                        where: { inventoryCode: savedIssue.productCode }
                    });

                    if (!currentInventory) {
                        throw new Error(`재고 정보를 찾을 수 없습니다: ${savedIssue.productCode}`);
                    }

                    const beforeQuantity = currentInventory.inventoryQuantity || 0;
                    const afterQuantity = beforeQuantity - savedIssue.issueQuantity;

                    if (afterQuantity < 0) {
                        throw new Error(`재고 부족: 현재 ${beforeQuantity}개, 요청 ${savedIssue.issueQuantity}개`);
                    }

                    const changeQuantityDto: ChangeQuantityDto = {
                        inventoryCode: savedIssue.productCode,
                        quantityChange: -savedIssue.issueQuantity, // 음수로 감소
                        reason: `불출 등록 - ${savedIssue.issueCode}`
                    };

                    await this.inventoryManagementService.changeInventoryQuantity(
                        changeQuantityDto,
                        username
                    );

                    // 상세한 재고 감소 로그 기록
                    const logDetails = [
                        `불출 등록으로 인한 재고 차감`,
                        `품목: ${savedIssue.productCode} (${savedIssue.productName})`,
                        `차감 전: ${beforeQuantity}개`,
                        `차감 수량: ${savedIssue.issueQuantity}개`,
                        `차감 후: ${afterQuantity}개`,
                        `담당자: ${savedIssue.employeeName || '미지정'}`,
                        `프로젝트: ${savedIssue.projectName || '미지정'}`,
                        `창고: ${savedIssue.warehouseName || '미지정'}`,
                        savedIssue.lotCode ? `LOT: ${savedIssue.lotCode}` : '',
                        `불출사유: ${savedIssue.issueReason || '미지정'}`
                    ].filter(Boolean).join(', ');

                    await this.logService.createDetailedLog({
                        moduleName: '재고관리',
                        action: 'INVENTORY_DECREASE',
                        username,
                        targetId: savedIssue.productCode,
                        details: logDetails
                    });

                    // 불출 등록 로그도 함께 기록
                    await this.logService.createDetailedLog({
                        moduleName: '불출관리',
                        action: 'INVENTORY_DEDUCTION_ON_REGISTRATION',
                        username,
                        targetId: savedIssue.issueCode,
                        details: `불출 등록 완료 및 재고 차감: ${savedIssue.issueCode} → ${savedIssue.productCode} (${savedIssue.productName}) ${savedIssue.issueQuantity}개 차감`
                    });

                } catch (inventoryError) {
                    // 재고 처리 실패 시 상세 로그 기록
                    await this.logService.createDetailedLog({
                        moduleName: '재고관리',
                        action: 'INVENTORY_DECREASE_FAILED',
                        username,
                        targetId: savedIssue.productCode,
                        details: `불출 등록 후 재고 차감 실패: ${savedIssue.productCode} (${savedIssue.productName}) - ${inventoryError.message}`
                    });

                    // 불출 등록 실패 로그도 기록
                    await this.logService.createDetailedLog({
                        moduleName: '불출관리',
                        action: 'REGISTER_INVENTORY_DEDUCTION_FAILED',
                        username,
                        targetId: savedIssue.issueCode,
                        details: `불출 등록은 완료되었으나 재고 차감 실패: ${savedIssue.issueCode} - ${inventoryError.message}`
                    });

                    // 오류를 다시 던져서 호출자에게 알림
                    throw inventoryError;
                }
            } else {
                // 재고 차감 조건이 맞지 않는 경우 로그 기록
                await this.logService.createDetailedLog({
                    moduleName: '불출관리',
                    action: 'INVENTORY_DEDUCTION_SKIPPED',
                    username,
                    targetId: savedIssue.issueCode,
                    details: `재고 차감 건너뜀: ${savedIssue.issueCode} - 품목코드: ${savedIssue.productCode}, 수량: ${savedIssue.issueQuantity}`
                });
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불출관리',
                action: 'CREATE_SUCCESS',
                username,
                targetId: savedIssue.issueCode,
                details: `불출 정보 생성: ${savedIssue.issueCode} (품목: ${savedIssue.productName}, 수량: ${savedIssue.issueQuantity}, 승인상태: ${savedIssue.approvalStatus})`
            });

            return {
                success: true,
                message: '불출 정보가 성공적으로 등록되었습니다.',
                issue: savedIssue
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불출관리',
                action: 'CREATE_FAILED',
                username,
                targetId: createInventoryIssueDto.productCode || 'UNKNOWN',
                details: error.message
            });

            throw new BadRequestException(`불출 정보 등록 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 불출 내역 목록을 조회합니다.
     */
    async getInventoryIssueList(searchParams: {
        page?: number;
        limit?: number;
        search?: string;
        productName?: string;
        employeeName?: string;
        projectName?: string;
        warehouseName?: string;
        approvalStatus?: string;
    } = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                productName,
                employeeName,
                projectName,
                warehouseName,
                approvalStatus
            } = searchParams;

            // 기본 쿼리 생성
            const query = this.inventoryIssueRepository
                .createQueryBuilder('i')
                .select([
                    'i.id as id',
                    'i.issueCode as issueCode',
                    'i.issueDate as issueDate',
                    'i.productCode as productCode',
                    'i.productName as productName',
                    'i.unit as unit',
                    'i.issueQuantity as issueQuantity',
                    'i.warehouseCode as warehouseCode',
                    'i.warehouseName as warehouseName',
                    'i.lotCode as lotCode',
                    'i.employeeCode as employeeCode',
                    'i.employeeName as employeeName',
                    'i.projectCode as projectCode',
                    'i.projectName as projectName',
                    'i.issueReason as issueReason',
                    'i.remark as remark',
                    'i.approvalStatus as approvalStatus',
                    'i.createdAt as createdAt',
                    'i.updatedAt as updatedAt'
                ])
                .orderBy('i.issueDate', 'DESC')
                .addOrderBy('i.createdAt', 'DESC');

            // 통합 검색 (품목명, 담당자명)
            if (search) {
                query.andWhere(
                    '(i.productName LIKE :search OR i.employeeName LIKE :search)',
                    { search: `%${search}%` }
                );
            }

            // 컬럼별 검색 조건
            if (productName) {
                query.andWhere('i.productName LIKE :productName', { productName: `%${productName}%` });
            }

            if (employeeName) {
                query.andWhere('i.employeeName LIKE :employeeName', { employeeName: `%${employeeName}%` });
            }

            if (projectName) {
                query.andWhere('i.projectName LIKE :projectName', { projectName: `%${projectName}%` });
            }

            if (warehouseName) {
                query.andWhere('i.warehouseName LIKE :warehouseName', { warehouseName: `%${warehouseName}%` });
            }

            if (approvalStatus) {
                query.andWhere('i.approvalStatus = :approvalStatus', { approvalStatus });
            }

            // 전체 개수 조회
            const total = await query.getCount();

            // 페이지네이션 적용
            const offset = (page - 1) * limit;
            const results = await query
                .offset(offset)
                .limit(limit)
                .getRawMany();

            // 결과 데이터 변환
            const data = results.map((row: any) => ({
                id: row.id,
                issueCode: row.issueCode,
                issueDate: row.issueDate,
                productCode: row.productCode,
                productName: row.productName,
                unit: row.unit,
                issueQuantity: parseInt(row.issueQuantity) || 0,
                warehouseCode: row.warehouseCode,
                warehouseName: row.warehouseName,
                lotCode: row.lotCode,
                employeeCode: row.employeeCode,
                employeeName: row.employeeName,
                projectCode: row.projectCode,
                projectName: row.projectName,
                issueReason: row.issueReason,
                remark: row.remark,
                approvalStatus: row.approvalStatus,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
            }));

            const totalPages = Math.ceil(total / limit);

            return {
                data,
                total,
                page,
                limit,
                totalPages
            };

        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '불출관리 불출내역 조회',
                action: 'READ_FAILED',
                username: 'system',
                targetId: 'inventory-issue-list',
                details: `불출내역 조회 실패: ${error.message}`,
            });
            throw error;
        }
    }

    /**
     * 불출 정보를 승인합니다.
     */
    async approveInventoryIssue(issueCode: string, username: string = 'system') {
        try {
            const issue = await this.inventoryIssueRepository.findOne({
                where: { issueCode }
            });

            if (!issue) {
                throw new NotFoundException(`불출 정보를 찾을 수 없습니다: ${issueCode}`);
            }

            if (issue.approvalStatus === '승인') {
                throw new BadRequestException('이미 승인된 불출 정보입니다.');
            }

            // 승인 상태로 변경
            issue.approvalStatus = '승인';
            issue.updatedBy = username;
            await this.inventoryIssueRepository.save(issue);

            // 재고 수량 감소 처리
            if (issue.productCode && issue.issueQuantity > 0) {
                try {
                    // 재고 차감 전 현재 수량 조회
                    const currentInventory = await this.inventoryRepository.findOne({
                        where: { inventoryCode: issue.productCode }
                    });

                    if (!currentInventory) {
                        throw new Error(`재고 정보를 찾을 수 없습니다: ${issue.productCode}`);
                    }

                    const beforeQuantity = currentInventory.inventoryQuantity || 0;
                    const afterQuantity = beforeQuantity - issue.issueQuantity;

                    if (afterQuantity < 0) {
                        throw new Error(`재고 부족: 현재 ${beforeQuantity}개, 요청 ${issue.issueQuantity}개`);
                    }

                    const changeQuantityDto: ChangeQuantityDto = {
                        inventoryCode: issue.productCode,
                        quantityChange: -issue.issueQuantity, // 음수로 감소
                        reason: `불출 승인 - ${issue.issueCode}`
                    };

                    await this.inventoryManagementService.changeInventoryQuantity(
                        changeQuantityDto,
                        username
                    );

                    // 상세한 재고 감소 로그 기록
                    const logDetails = [
                        `불출 승인으로 인한 재고 차감`,
                        `품목: ${issue.productCode} (${issue.productName})`,
                        `차감 전: ${beforeQuantity}개`,
                        `차감 수량: ${issue.issueQuantity}개`,
                        `차감 후: ${afterQuantity}개`,
                        `담당자: ${issue.employeeName || '미지정'}`,
                        `프로젝트: ${issue.projectName || '미지정'}`,
                        `창고: ${issue.warehouseName || '미지정'}`,
                        issue.lotCode ? `LOT: ${issue.lotCode}` : '',
                        `불출사유: ${issue.issueReason || '미지정'}`
                    ].filter(Boolean).join(', ');

                    await this.logService.createDetailedLog({
                        moduleName: '재고관리',
                        action: 'INVENTORY_DECREASE',
                        username,
                        targetId: issue.productCode,
                        details: logDetails
                    });

                    // 불출 승인 로그도 함께 기록
                    await this.logService.createDetailedLog({
                        moduleName: '불출관리',
                        action: 'INVENTORY_DEDUCTION_COMPLETED',
                        username,
                        targetId: issue.issueCode,
                        details: `불출 승인 완료 및 재고 차감: ${issue.issueCode} → ${issue.productCode} (${issue.productName}) ${issue.issueQuantity}개 차감`
                    });

                } catch (inventoryError) {
                    // 재고 처리 실패 시 상세 로그 기록
                    await this.logService.createDetailedLog({
                        moduleName: '재고관리',
                        action: 'INVENTORY_DECREASE_FAILED',
                        username,
                        targetId: issue.productCode,
                        details: `불출 승인 후 재고 차감 실패: ${issue.productCode} (${issue.productName}) - ${inventoryError.message}`
                    });

                    // 불출 승인 실패 로그도 기록
                    await this.logService.createDetailedLog({
                        moduleName: '불출관리',
                        action: 'APPROVE_INVENTORY_DEDUCTION_FAILED',
                        username,
                        targetId: issue.issueCode,
                        details: `불출 승인은 완료되었으나 재고 차감 실패: ${issue.issueCode} - ${inventoryError.message}`
                    });

                    // 오류를 다시 던져서 호출자에게 알림
                    throw inventoryError;
                }
            } else {
                // 재고 차감 조건이 맞지 않는 경우 로그 기록
                await this.logService.createDetailedLog({
                    moduleName: '불출관리',
                    action: 'INVENTORY_DEDUCTION_SKIPPED',
                    username,
                    targetId: issue.issueCode,
                    details: `재고 차감 건너뜀: ${issue.issueCode} - 품목코드: ${issue.productCode}, 수량: ${issue.issueQuantity}`
                });
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불출관리',
                action: 'APPROVE_SUCCESS',
                username,
                targetId: issue.issueCode,
                details: `불출 승인: ${issue.issueCode} (품목: ${issue.productName}, 수량: ${issue.issueQuantity})`
            });

            return {
                success: true,
                message: '불출이 성공적으로 승인되었습니다.',
                issue
            };

        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '불출관리',
                action: 'APPROVE_FAILED',
                username,
                targetId: issueCode,
                details: error.message
            });

            throw error;
        }
    }
}
