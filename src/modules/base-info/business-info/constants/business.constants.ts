export const BUSINESS_CONSTANTS = {
  // 정규식
  BUSINESS_NUMBER_REGEX: /^\d{10}$/,
  NUMBERS_ONLY_REGEX: /^\d+$/,

  // 코드 관련
  DEFAULT_BUSINESS_CODE: 'BUS001',
  BUSINESS_CODE_PREFIX: 'BUS',
  BUSINESS_CODE_LENGTH: 3,

  // 에러 메시지
  ERROR_MESSAGES: {
    BUSINESS_NUMBER_REQUIRED: '사업자 등록번호가 누락되었습니다.',
    BUSINESS_NAME_REQUIRED: '사업장명이 누락되었습니다.',
    BUSINESS_CEO_REQUIRED: '대표자명이 누락되었습니다.',
    BUSINESS_NUMBER_FORMAT: '사업자 등록번호는 10자리 숫자여야 합니다.',
    BUSINESS_NUMBER_DUPLICATE: '이미 사용중인 사업자 번호입니다.',
    NUMBERS_ONLY: '숫자만 입력 가능합니다.',
  },
} as const;
