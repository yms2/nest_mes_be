import { Test, TestingModule } from '@nestjs/testing';
import { CustomerInfoReadController } from './customer-info-read.controller';
import { CustomerInfoHandler } from '../handlers/customer-info.handler';
import { SearchCustomerInfoDto } from '../dto/customer-info-search.dto';
import { CustomerInfo } from '../entities/customer-info.entity';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('CustomerInfoReadController', () => {
  let controller: CustomerInfoReadController;
  let handler: CustomerInfoHandler;

  const mockCustomerInfo: CustomerInfo = {
    id: 1,
    customerCode: 'C001',
    customerNumber: '1234567890',
    customerName: '테스트 거래처',
    customerCorporateRegistrationNumber: '112332-1323333',
    customerType: '매출처',
    customerCeo: '홍길동',
    customerBusinessType: '제조업',
    customerBusinessItem: '자동차 제조업',
    customerTel: '02-1234-5678',
    customerMobile: '010-1234-5678',
    customerFax: '02-1234-5679',
    customerEmail: 'test@test.com',
    customerInvoiceEmail: 'invoice@test.com',
    customerZipcode: '12345',
    customerAddress: '서울시 강남구',
    customerAddressDetail: '123-45',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockHandler = {
    handleSingleRead: jest.fn(),
    handleDateRangeSearch: jest.fn(),
    handleSearch: jest.fn(),
    handleListRead: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerInfoReadController],
      providers: [
        {
          provide: CustomerInfoHandler,
          useValue: mockHandler,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<CustomerInfoReadController>(CustomerInfoReadController);
    handler = module.get<CustomerInfoHandler>(CustomerInfoHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomerInfo', () => {
    it('should handle single customer read by customer number', async () => {
      const query: SearchCustomerInfoDto = {
        customerNumber: '1234567890',
        page: 1,
        limit: 10,
      };

      const expectedResponse = {
        success: true,
        message: '거래처 정보 조회 성공',
        data: mockCustomerInfo,
        timestamp: expect.any(String),
      };

      mockHandler.handleSingleRead.mockResolvedValue(expectedResponse);

      const result = await controller.getCustomerInfo(query);

      expect(result).toEqual(expectedResponse);
      expect(mockHandler.handleSingleRead).toHaveBeenCalledWith(query);
    });

    it('should handle date range search', async () => {
      const query: SearchCustomerInfoDto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        page: 1,
        limit: 10,
      };

      const expectedResponse = {
        success: true,
        message: '거래처 정보 검색 성공',
        data: [mockCustomerInfo],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
        timestamp: expect.any(String),
      };

      mockHandler.handleDateRangeSearch.mockResolvedValue(expectedResponse);

      const result = await controller.getCustomerInfo(query);

      expect(result).toEqual(expectedResponse);
      expect(mockHandler.handleDateRangeSearch).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-12-31',
        { page: 1, limit: 10 }
      );
    });

    it('should handle search by keyword', async () => {
      const query: SearchCustomerInfoDto = {
        search: '테스트',
        page: 1,
        limit: 10,
      };

      const expectedResponse = {
        success: true,
        message: '거래처 정보 검색 성공',
        data: [mockCustomerInfo],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
        timestamp: expect.any(String),
      };

      mockHandler.handleSearch.mockResolvedValue(expectedResponse);

      const result = await controller.getCustomerInfo(query);

      expect(result).toEqual(expectedResponse);
      expect(mockHandler.handleSearch).toHaveBeenCalledWith('테스트', { page: 1, limit: 10 });
    });

    it('should handle list read when no specific query', async () => {
      const query: SearchCustomerInfoDto = {
        page: 1,
        limit: 10,
      };

      const expectedResponse = {
        success: true,
        message: '거래처 정보 목록 조회 성공',
        data: [mockCustomerInfo],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
        timestamp: expect.any(String),
      };

      mockHandler.handleListRead.mockResolvedValue(expectedResponse);

      const result = await controller.getCustomerInfo(query);

      expect(result).toEqual(expectedResponse);
      expect(mockHandler.handleListRead).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should use default pagination when not provided', async () => {
      const query: SearchCustomerInfoDto = {
        page: 1,
        limit: 10,
      };

      const expectedResponse = {
        success: true,
        message: '거래처 정보 목록 조회 성공',
        data: [mockCustomerInfo],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
        timestamp: expect.any(String),
      };

      mockHandler.handleListRead.mockResolvedValue(expectedResponse);

      const result = await controller.getCustomerInfo(query);

      expect(result).toEqual(expectedResponse);
      expect(mockHandler.handleListRead).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should handle empty customer number', async () => {
      const query: SearchCustomerInfoDto = {
        customerNumber: '',
        page: 1,
        limit: 10,
      };

      const expectedResponse = {
        success: true,
        message: '거래처 정보 목록 조회 성공',
        data: [mockCustomerInfo],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
        timestamp: expect.any(String),
      };

      mockHandler.handleListRead.mockResolvedValue(expectedResponse);

      const result = await controller.getCustomerInfo(query);

      expect(result).toEqual(expectedResponse);
      expect(mockHandler.handleListRead).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should handle empty search keyword', async () => {
      const query: SearchCustomerInfoDto = {
        search: '',
        page: 1,
        limit: 10,
      };

      const expectedResponse = {
        success: true,
        message: '거래처 정보 목록 조회 성공',
        data: [mockCustomerInfo],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
        timestamp: expect.any(String),
      };

      mockHandler.handleListRead.mockResolvedValue(expectedResponse);

      const result = await controller.getCustomerInfo(query);

      expect(result).toEqual(expectedResponse);
      expect(mockHandler.handleListRead).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });
}); 