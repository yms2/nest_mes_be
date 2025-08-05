import { CUSTOMER_CONSTANTS } from '../constants/customer.constants';

export class CustomerUtils {
  static validateCustomerNumber(customerNumber: string): boolean {
    return /^[0-9]{10}$/.test(customerNumber);
  }

  static validateNumbersOnly(value: string): boolean {
    return /^[0-9]+$/.test(value);
  }

  static getNextCodeNumber(lastCustomerCode: string | null): number {
    if (!lastCustomerCode) {
        return 1;
    }

    // CUS 접두사를 제거하고 숫자 부분만 추출
    const prefix = CUSTOMER_CONSTANTS.CODE.PREFIX;
    if (!lastCustomerCode.startsWith(prefix)) {
        return 1;
    }

    const numberPart = lastCustomerCode.substring(prefix.length);
    const lastNumber = parseInt(numberPart, 10);
    
    // NaN 체크
    if (isNaN(lastNumber)) {
        return 1;
    }

    return lastNumber + 1;
  }

  static generateCustomerCode(codeNumber: number): string {
    return `${CUSTOMER_CONSTANTS.CODE.PREFIX}${String(codeNumber).padStart(
      CUSTOMER_CONSTANTS.CODE.LENGTH,
      '0',
    )}`;
  }

}