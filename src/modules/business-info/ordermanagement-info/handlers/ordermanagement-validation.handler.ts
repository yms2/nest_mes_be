import { BadRequestException } from '@nestjs/common';
import { UpdateOrderManagementDto } from '../dto/ordermanagement-update.dto';

export class OrderManagementValidationHandler {
    /**
     * 수주 정보 수정 데이터의 유효성을 검증합니다.
     * @param updateOrderManagementDto 수정할 수주 데이터
     */
    static validateUpdateData(updateOrderManagementDto: UpdateOrderManagementDto): void {
        // 수량 검증
        if (updateOrderManagementDto.quantity !== undefined && updateOrderManagementDto.quantity <= 0) {
            throw new BadRequestException('수량은 0보다 커야 합니다.');
        }

        // 가격 검증
        if (updateOrderManagementDto.unitPrice !== undefined && updateOrderManagementDto.unitPrice < 0) {
            throw new BadRequestException('단가는 0 이상이어야 합니다.');
        }

        if (updateOrderManagementDto.supplyPrice !== undefined && updateOrderManagementDto.supplyPrice < 0) {
            throw new BadRequestException('공급가액은 0 이상이어야 합니다.');
        }

        if (updateOrderManagementDto.vat !== undefined && updateOrderManagementDto.vat < 0) {
            throw new BadRequestException('부가세는 0 이상이어야 합니다.');
        }

        if (updateOrderManagementDto.total !== undefined && updateOrderManagementDto.total < 0) {
            throw new BadRequestException('총 금액은 0 이상이어야 합니다.');
        }

        // 날짜 검증
        if (updateOrderManagementDto.deliveryDate !== undefined && updateOrderManagementDto.orderDate !== undefined) {
            if (new Date(updateOrderManagementDto.deliveryDate) < new Date(updateOrderManagementDto.orderDate)) {
                throw new BadRequestException('납기일은 수주일보다 늦어야 합니다.');
            }
        }

        // 문자열 길이 검증
        if (updateOrderManagementDto.customerCode !== undefined && updateOrderManagementDto.customerCode.length > 20) {
            throw new BadRequestException('고객 코드는 20자를 초과할 수 없습니다.');
        }

        if (updateOrderManagementDto.customerName !== undefined && updateOrderManagementDto.customerName.length > 20) {
            throw new BadRequestException('고객명은 20자를 초과할 수 없습니다.');
        }

        if (updateOrderManagementDto.projectCode !== undefined && updateOrderManagementDto.projectCode.length > 20) {
            throw new BadRequestException('프로젝트 코드는 20자를 초과할 수 없습니다.');
        }

        if (updateOrderManagementDto.projectName !== undefined && updateOrderManagementDto.projectName.length > 20) {
            throw new BadRequestException('프로젝트명은 20자를 초과할 수 없습니다.');
        }

        if (updateOrderManagementDto.productCode !== undefined && updateOrderManagementDto.productCode.length > 20) {
            throw new BadRequestException('제품 코드는 20자를 초과할 수 없습니다.');
        }

        if (updateOrderManagementDto.productName !== undefined && updateOrderManagementDto.productName.length > 20) {
            throw new BadRequestException('제품명은 20자를 초과할 수 없습니다.');
        }

        if (updateOrderManagementDto.orderType !== undefined && updateOrderManagementDto.orderType.length > 20) {
            throw new BadRequestException('수주 타입은 20자를 초과할 수 없습니다.');
        }

        if (updateOrderManagementDto.estimateCode !== undefined && updateOrderManagementDto.estimateCode.length > 20) {
            throw new BadRequestException('견적 코드는 20자를 초과할 수 없습니다.');
        }

        if (updateOrderManagementDto.remark !== undefined && updateOrderManagementDto.remark.length > 20) {
            throw new BadRequestException('비고는 20자를 초과할 수 없습니다.');
        }

        // 날짜 형식 검증
        if (updateOrderManagementDto.orderDate !== undefined) {
            if (isNaN(Date.parse(updateOrderManagementDto.orderDate))) {
                throw new BadRequestException('수주일은 유효한 날짜 형식이어야 합니다.');
            }
        }

        if (updateOrderManagementDto.deliveryDate !== undefined) {
            if (isNaN(Date.parse(updateOrderManagementDto.deliveryDate))) {
                throw new BadRequestException('납기일은 유효한 날짜 형식이어야 합니다.');
            }
        }
    }

    /**
     * 수주 타입 변경 데이터의 유효성을 검증합니다.
     * @param orderType 수주 타입
     */
    static validateOrderType(orderType: string): void {
        if (!orderType || orderType.trim().length === 0) {
            throw new BadRequestException('수주 타입은 비어있을 수 없습니다.');
        }

        if (orderType.length > 20) {
            throw new BadRequestException('수주 타입은 20자를 초과할 수 없습니다.');
        }

        // 허용된 수주 타입 검증 (필요시 추가)
        const allowedOrderTypes = ['신규', 'AS', '수리', '교체', '유지보수'];
        if (!allowedOrderTypes.includes(orderType)) {
            throw new BadRequestException(`허용되지 않는 수주 타입입니다. 허용된 타입: ${allowedOrderTypes.join(', ')}`);
        }
    }

    /**
     * 수량 변경 데이터의 유효성을 검증합니다.
     * @param quantity 수량
     */
    static validateQuantity(quantity: number): void {
        if (quantity <= 0) {
            throw new BadRequestException('수량은 0보다 커야 합니다.');
        }

        if (quantity > 999999) {
            throw new BadRequestException('수량은 999,999를 초과할 수 없습니다.');
        }

        if (!Number.isInteger(quantity)) {
            throw new BadRequestException('수량은 정수여야 합니다.');
        }
    }

    /**
     * 가격 데이터의 유효성을 검증합니다.
     * @param price 가격
     * @param fieldName 필드명 (에러 메시지용)
     */
    static validatePrice(price: number, fieldName: string): void {
        if (price < 0) {
            throw new BadRequestException(`${fieldName}는 0 이상이어야 합니다.`);
        }

        if (price > 999999999) {
            throw new BadRequestException(`${fieldName}는 999,999,999를 초과할 수 없습니다.`);
        }

        if (!Number.isFinite(price)) {
            throw new BadRequestException(`${fieldName}는 유효한 숫자여야 합니다.`);
        }
    }

    /**
     * 날짜 데이터의 유효성을 검증합니다.
     * @param dateString 날짜 문자열
     * @param fieldName 필드명 (에러 메시지용)
     */
    static validateDate(dateString: string, fieldName: string): void {
        if (!dateString || dateString.trim().length === 0) {
            throw new BadRequestException(`${fieldName}는 비어있을 수 없습니다.`);
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new BadRequestException(`${fieldName}는 유효한 날짜 형식이어야 합니다.`);
        }

        // 과거 날짜 제한 (필요시 조정)
        const minDate = new Date('2000-01-01');
        if (date < minDate) {
            throw new BadRequestException(`${fieldName}는 2000년 1월 1일 이후여야 합니다.`);
        }

        // 미래 날짜 제한 (필요시 조정)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 10); // 10년 후까지
        if (date > maxDate) {
            throw new BadRequestException(`${fieldName}는 10년 이내여야 합니다.`);
        }
    }

    /**
     * 문자열 데이터의 유효성을 검증합니다.
     * @param value 문자열 값
     * @param fieldName 필드명 (에러 메시지용)
     * @param maxLength 최대 길이
     */
    static validateString(value: string, fieldName: string, maxLength: number = 20): void {
        if (value !== undefined && value !== null) {
            if (typeof value !== 'string') {
                throw new BadRequestException(`${fieldName}는 문자열이어야 합니다.`);
            }

            if (value.length > maxLength) {
                throw new BadRequestException(`${fieldName}는 ${maxLength}자를 초과할 수 없습니다.`);
            }

            // 특수문자나 위험한 문자 검증 (필요시 추가)
            const dangerousChars = /[<>\"'&]/;
            if (dangerousChars.test(value)) {
                throw new BadRequestException(`${fieldName}에 허용되지 않는 문자가 포함되어 있습니다.`);
            }
        }
    }
}
