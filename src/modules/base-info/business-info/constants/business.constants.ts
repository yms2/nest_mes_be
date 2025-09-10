export const BUSINESS_CONSTANTS = {
  // 정규식
  REGEX: {
    BUSINESS_NUMBER: /^\d{10}$/,
    NUMBERS_ONLY: /^\d+$/,
  },

  // 코드 관련
  CODE: {
    DEFAULT: 'BUS001',
    PREFIX: 'BUS',
    LENGTH: 3,
  },

  // 에러 코드 및 메시지
  ERROR: {
    BUSINESS_NUMBER_REQUIRED: { code: 'B1001', message: '사업자 등록번호가 누락되었습니다.' },
    BUSINESS_NAME_REQUIRED: { code: 'B1002', message: '사업장명이 누락되었습니다.' },
    BUSINESS_CEO_REQUIRED: { code: 'B1003', message: '대표자명이 누락되었습니다.' },
    BUSINESS_NUMBER_FORMAT: { code: 'B1004', message: '사업자 등록번호는 10자리 숫자여야 합니다.' },
    BUSINESS_NUMBER_DUPLICATE: { code: 'B1005', message: '이미 사용중인 사업자 번호입니다.' },
    NUMBERS_ONLY: { code: 'B1006', message: '숫자만 입력 가능합니다.' },
  },
} as const;
