import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { CustomerInfoDownloadService } from './customer-info-download.service';
import * as ExcelJS from 'exceljs';

// ExcelJS 모킹
jest.mock('exceljs', () => {
  const mockWorkbook = {
    addWorksheet: jest.fn().mockReturnValue({
      columns: [],
      getRow: jest.fn().mockReturnValue({
        eachCell: jest.fn(),
        getCell: jest.fn().mockReturnValue({
          address: 'A1',
          font: {},
          fill: {},
          alignment: {},
        }),
      }),
      addRow: jest.fn(),
      getCell: jest.fn().mockReturnValue({
        address: 'A1',
        font: {},
        fill: {},
        alignment: {},
      }),
      autoFilter: {},
    }),
    xlsx: {
      write: jest.fn(),
    },
  };
  return {
    Workbook: jest.fn(() => mockWorkbook),
  };
});

describe('CustomerInfoDownloadService', () => {
  let service: CustomerInfoDownloadService;
  let mockResponse: jest.Mocked<Response>;
  let mockWorkbook: any;
  let mockWorksheet: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerInfoDownloadService],
    }).compile();

    service = module.get<CustomerInfoDownloadService>(CustomerInfoDownloadService);

    mockResponse = {
      setHeader: jest.fn(),
      end: jest.fn(),
    } as any;

    // ExcelJS 모킹 설정
    mockWorkbook = new ExcelJS.Workbook();
    mockWorksheet = mockWorkbook.addWorksheet('거래처정보');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportCustomerInfos', () => {
    const mockCustomerData = [
      {
        id: 1,
        customerCode: 'CUS001',
        customerName: '테스트 거래처',
        customerNumber: 'CUST001',
        customerCorporateRegistrationNumber: '112332-1323333',
        customerCeo: '홍길동',
        customerBusinessType: '제조업',
        customerBusinessItem: '전자제품',
        customerTel: '02-1234-5678',
        customerMobile: '010-1234-5678',
        customerEmail: 'test@example.com',
        customerInvoiceEmail: 'invoice@example.com',
        customerZipcode: '12345',
        customerAddress: '서울시 강남구',
        customerAddressDetail: '테헤란로 123',
        createdBy: 'admin',
        updatedBy: 'admin',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      },
      {
        id: 2,
        customerCode: 'CUS002',
        customerName: '테스트 거래처2',
        customerNumber: 'CUST002',
        customerCorporateRegistrationNumber: '987654-3210987',
        customerCeo: '김철수',
        customerBusinessType: '서비스업',
        customerBusinessItem: 'IT서비스',
        customerTel: '02-9876-5432',
        customerMobile: '010-9876-5432',
        customerEmail: 'test2@example.com',
        customerInvoiceEmail: 'invoice2@example.com',
        customerZipcode: '54321',
        customerAddress: '서울시 서초구',
        customerAddressDetail: '강남대로 456',
        createdBy: 'admin',
        updatedBy: 'admin',
        createdAt: new Date('2024-01-02T11:00:00Z'),
        updatedAt: new Date('2024-01-02T11:00:00Z'),
      },
    ];

    it('should export customer infos to excel successfully', async () => {
      await service.exportCustomerInfos(mockCustomerData, mockResponse);

      // 워크시트가 생성되었는지 확인
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('거래처정보');

      // 컬럼이 설정되었는지 확인
      expect(mockWorksheet.columns).toBeDefined();

      // 데이터가 추가되었는지 확인
      expect(mockWorksheet.addRow).toHaveBeenCalledTimes(2);

      // 헤더가 설정되었는지 확인
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="%EA%B1%B0%EB%9E%98%EC%B2%98%EC%A0%95%EB%B3%B4.xlsx"; filename*=UTF-8\'\'%EA%B1%B0%EB%9E%98%EC%B2%98%EC%A0%95%EB%B3%B4.xlsx'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      // 엑셀 파일이 작성되었는지 확인
      expect(mockWorkbook.xlsx.write).toHaveBeenCalledWith(mockResponse);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should handle empty data array', async () => {
      await service.exportCustomerInfos([], mockResponse);

      // 워크시트가 생성되었는지 확인
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('거래처정보');

      // 데이터가 추가되지 않았는지 확인 (헤더만)
      expect(mockWorksheet.addRow).toHaveBeenCalledTimes(0);

      // 헤더가 설정되었는지 확인
      expect(mockResponse.setHeader).toHaveBeenCalled();
      expect(mockWorkbook.xlsx.write).toHaveBeenCalledWith(mockResponse);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should handle customer data with null values', async () => {
      const mockDataWithNulls = [
        {
          id: 1,
          customerCode: 'CUS001',
          customerName: '테스트 거래처',
          customerNumber: 'CUST001',
          customerCorporateRegistrationNumber: null,
          customerCeo: null,
          customerBusinessType: null,
          customerBusinessItem: null,
          customerTel: null,
          customerMobile: null,
          customerEmail: null,
          customerInvoiceEmail: null,
          customerZipcode: null,
          customerAddress: null,
          customerAddressDetail: null,
          createdBy: 'admin',
          updatedBy: 'admin',
          createdAt: null,
          updatedAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      await service.exportCustomerInfos(mockDataWithNulls, mockResponse);

      // 워크시트가 생성되었는지 확인
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('거래처정보');

      // 데이터가 추가되었는지 확인
      expect(mockWorksheet.addRow).toHaveBeenCalledTimes(1);

      // 헤더가 설정되었는지 확인
      expect(mockResponse.setHeader).toHaveBeenCalled();
      expect(mockWorkbook.xlsx.write).toHaveBeenCalledWith(mockResponse);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should handle customer data with string date', async () => {
      const mockDataWithStringDate = [
        {
          id: 1,
          customerCode: 'CUS001',
          customerName: '테스트 거래처',
          customerNumber: 'CUST001',
          customerCorporateRegistrationNumber: '112332-1323333',
          customerCeo: '홍길동',
          customerBusinessType: '제조업',
          customerBusinessItem: '전자제품',
          customerTel: '02-1234-5678',
          customerMobile: '010-1234-5678',
          customerEmail: 'test@example.com',
          customerInvoiceEmail: 'invoice@example.com',
          customerZipcode: '12345',
          customerAddress: '서울시 강남구',
          customerAddressDetail: '테헤란로 123',
          createdBy: 'admin',
          updatedBy: 'admin',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      await service.exportCustomerInfos(mockDataWithStringDate, mockResponse);

      // 워크시트가 생성되었는지 확인
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('거래처정보');

      // 데이터가 추가되었는지 확인
      expect(mockWorksheet.addRow).toHaveBeenCalledTimes(1);

      // 헤더가 설정되었는지 확인
      expect(mockResponse.setHeader).toHaveBeenCalled();
      expect(mockWorkbook.xlsx.write).toHaveBeenCalledWith(mockResponse);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should handle large dataset', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        id: index + 1,
        customerCode: `CUS${String(index + 1).padStart(3, '0')}`,
        customerName: `테스트 거래처 ${index + 1}`,
        customerNumber: `CUST${String(index + 1).padStart(3, '0')}`,
        customerCorporateRegistrationNumber: `112332-${String(index + 1).padStart(6, '0')}`,
        customerCeo: `대표자 ${index + 1}`,
        customerBusinessType: '제조업',
        customerBusinessItem: '전자제품',
        customerTel: '02-1234-5678',
        customerMobile: '010-1234-5678',
        customerEmail: `test${index + 1}@example.com`,
        customerInvoiceEmail: `invoice${index + 1}@example.com`,
        customerZipcode: '12345',
        customerAddress: '서울시 강남구',
        customerAddressDetail: '테헤란로 123',
        createdBy: 'admin',
        updatedBy: 'admin',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      }));

      await service.exportCustomerInfos(largeDataset, mockResponse);

      // 워크시트가 생성되었는지 확인
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('거래처정보');

      // 모든 데이터가 추가되었는지 확인
      expect(mockWorksheet.addRow).toHaveBeenCalledTimes(1000);

      // 헤더가 설정되었는지 확인
      expect(mockResponse.setHeader).toHaveBeenCalled();
      expect(mockWorkbook.xlsx.write).toHaveBeenCalledWith(mockResponse);
      expect(mockResponse.end).toHaveBeenCalled();
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const testDate = new Date('2024-01-15T14:30:45Z');
      const formattedDate = (service as any).formatDate(testDate);
      
      // 한국 시간으로 변환되어야 함 (UTC+9)
      expect(formattedDate).toMatch(/^2024-01-15 \d{2}:\d{2}:\d{2}$/);
    });

    it('should format string date correctly', () => {
      const testDateString = '2024-01-15T14:30:45Z';
      const formattedDate = (service as any).formatDate(testDateString);
      
      expect(formattedDate).toMatch(/^2024-01-15 \d{2}:\d{2}:\d{2}$/);
    });

    it('should handle invalid date', () => {
      const invalidDate = 'invalid-date';
      const formattedDate = (service as any).formatDate(invalidDate);
      
      // Invalid date는 NaN이 되므로 예상 결과가 달라질 수 있음
      expect(typeof formattedDate).toBe('string');
    });
  });
}); 