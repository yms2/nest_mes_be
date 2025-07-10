import { BUSINESS_CONSTANTS } from '../constants/business.constants';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class BusinessUtils {
  /**
   * 사업자 번호 유효성 검사
   */
  static validateBusinessNumber(businessNumber: string): boolean {
    return BUSINESS_CONSTANTS.REGEX.BUSINESS_NUMBER.test(businessNumber);
  }

  // /**
  //  * 숫자만 허용하는 유효성 검사
  //  */
    static validateNumbersOnly(value: string): boolean {
      if (value === undefined || value === null || value === '') {
        return true; // 빈 값 허용
      }
      return /^[\d-]+$/.test(value); // 숫자 또는 하이픈만 허용
    }


  /**
   * 숫자 필드 검증 (빈 값 허용)
   */
  static validateNumberField(value: string | undefined, fieldName: string): void {
    if (value && !this.validateNumbersOnly(value)) {
      throw new ValidationError(`${fieldName}: ${BUSINESS_CONSTANTS.ERROR.NUMBERS_ONLY.message}`);
    }
  }

  /**
   * 다음 사업장 코드 생성
   */
  static generateNextBusinessCode(lastBusinessCode: string | null): string {
    if (!lastBusinessCode) {
      return BUSINESS_CONSTANTS.CODE.DEFAULT;
    }

    const lastCodeNumber = lastBusinessCode.split(BUSINESS_CONSTANTS.CODE.PREFIX)[1];
    const nextNumber = Number(lastCodeNumber) + 1;

    return `${BUSINESS_CONSTANTS.CODE.PREFIX}${String(nextNumber).padStart(
      BUSINESS_CONSTANTS.CODE.LENGTH,
      '0',
    )}`;
  }

  /**
   * 필수 필드 검증
   */
  static validateRequiredFields(fields: Record<string, any>): void {
    const requiredFields = [
      {
        field: 'businessNumber',
        message: BUSINESS_CONSTANTS.ERROR.BUSINESS_NUMBER_REQUIRED,
      },
      {
        field: 'businessName',
        message: BUSINESS_CONSTANTS.ERROR.BUSINESS_NAME_REQUIRED,
      },
      {
        field: 'businessCeo',
        message: BUSINESS_CONSTANTS.ERROR.BUSINESS_CEO_REQUIRED,
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!fields[field]) {
        throw new ValidationError([message.message, message.code].join(' '));
      }
    }
  }
}
