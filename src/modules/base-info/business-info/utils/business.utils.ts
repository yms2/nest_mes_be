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
    return BUSINESS_CONSTANTS.BUSINESS_NUMBER_REGEX.test(businessNumber);
  }

  /**
   * 숫자만 허용하는 유효성 검사
   */
  static validateNumbersOnly(value: string): boolean {
    return BUSINESS_CONSTANTS.NUMBERS_ONLY_REGEX.test(value);
  }

  /**
   * 숫자 필드 검증 (빈 값 허용)
   */
  static validateNumberField(value: string | undefined, fieldName: string): void {
    if (value && !this.validateNumbersOnly(value)) {
      throw new ValidationError(`${fieldName}: ${BUSINESS_CONSTANTS.ERROR_MESSAGES.NUMBERS_ONLY}`);
    }
  }

  /**
   * 다음 사업장 코드 생성
   */
  static generateNextBusinessCode(lastBusinessCode: string | null): string {
    if (!lastBusinessCode) {
      return BUSINESS_CONSTANTS.DEFAULT_BUSINESS_CODE;
    }

    const lastCodeNumber = lastBusinessCode.split(BUSINESS_CONSTANTS.BUSINESS_CODE_PREFIX)[1];
    const nextNumber = Number(lastCodeNumber) + 1;

    return `${BUSINESS_CONSTANTS.BUSINESS_CODE_PREFIX}${String(nextNumber).padStart(
      BUSINESS_CONSTANTS.BUSINESS_CODE_LENGTH,
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
        message: BUSINESS_CONSTANTS.ERROR_MESSAGES.BUSINESS_NUMBER_REQUIRED,
      },
      {
        field: 'businessName',
        message: BUSINESS_CONSTANTS.ERROR_MESSAGES.BUSINESS_NAME_REQUIRED,
      },
      {
        field: 'businessCeo',
        message: BUSINESS_CONSTANTS.ERROR_MESSAGES.BUSINESS_CEO_REQUIRED,
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!fields[field]) {
        throw new ValidationError(message);
      }
    }
  }
}
