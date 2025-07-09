export const CUSTOMER_CONSTANTS = {
  // 정규식
  REGEX: {
    CUSTOMER_NUMBER: /^\d{10}$/,
    NUMBERS_ONLY: /^\d+$/,
  },
  
  // 코드 관련
  CODE: {
    DEFAULT: 'CUS001',
    PREFIX: 'CUS',
    LENGTH: 3,
  },

  // 에러 코드 및 메시지
  ERROR: {
    CUSTOMER_NUMBER_REQUIRED: { code: 'C1001', message: '사업자 등록번호가 누락되었습니다.' },
    CUSTOMER_NAME_REQUIRED: { code: 'C1002', message: '거래차명이 누락되었습니다.' },
    CUSTOMER_CEO_REQUIRED: { code: 'C1003', message: '대표자명이 누락되었습니다.' },
    CUSTOMER_NUMBER_FORMAT: { code: 'C1004', message: '사업자 등록번호는 10자리 숫자여야 합니다.' },
    CUSTOMER_NUMBER_DUPLICATE: { code: 'C1005', message: '이미 사용중인 사업자 번호입니다.' },
    NUMBERS_ONLY: { code: 'C1006', message: '숫자만 입력 가능합니다.' },
  }
} as const;