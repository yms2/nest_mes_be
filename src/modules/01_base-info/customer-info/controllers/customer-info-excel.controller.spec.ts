import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { CustomerInfoExcelController } from './customer-info-excel.controller';
import { CustomerInfoTemplateService } from '../services/customer-info-template.service';
import { CustomerInfoSearchService } from '../services/customer-info-search.service';
import { CustomerInfoReadService } from '../services/customer-info-read.service';
import { CustomerInfoDownloadService } from '../services/customer-info-download.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('CustomerInfoExcelController', () => {
  let controller: CustomerInfoExcelController;
  let mockTemplateService: jest.Mocked<CustomerInfoTemplateService>;
  let mockSearchService: jest.Mocked<CustomerInfoSearchService>;
  let mockReadService: jest.Mocked<CustomerInfoReadService>;
  let mockDownloadService: jest.Mocked<CustomerInfoDownloadService>;
  let mockResponse: jest.Mocked<Response>;

  beforeEach(async () => {
    const mockTemplateServiceProvider = {
      provide: CustomerInfoTemplateService,
      useValue: {
        generateUploadTemplate: jest.fn(),
      },
    };

    const mockSearchServiceProvider = {
      provide: CustomerInfoSearchService,
      useValue: {
        searchCustomerInfo: jest.fn(),
      },
    };

    const mockReadServiceProvider = {
      provide: CustomerInfoReadService,
      useValue: {
        getAllCustomerInfo: jest.fn(),
      },
    };

    const mockDownloadServiceProvider = {
      provide: CustomerInfoDownloadService,
      useValue: {
        exportCustomerInfos: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerInfoExcelController],
      providers: [
        mockTemplateServiceProvider,
        mockSearchServiceProvider,
        mockReadServiceProvider,
        mockDownloadServiceProvider,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CustomerInfoExcelController>(CustomerInfoExcelController);
    mockTemplateService = module.get(CustomerInfoTemplateService);
    mockSearchService = module.get(CustomerInfoSearchService);
    mockReadService = module.get(CustomerInfoReadService);
    mockDownloadService = module.get(CustomerInfoDownloadService);

    mockResponse = {
      setHeader: jest.fn(),
      end: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('downloadTemplate', () => {
    it('should download template successfully', async () => {
      const mockBuffer = Buffer.from('mock template data');
      mockTemplateService.generateUploadTemplate.mockResolvedValue(mockBuffer);

      await controller.downloadTemplate(mockResponse);

      expect(mockTemplateService.generateUploadTemplate).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="%EA%B1%B0%EB%9E%98%EC%B2%98%EC%A0%95%EB%B3%B4%20%EC%96%91%EC%8B%9D.xlsx"; filename*=UTF-8\'\'%EA%B1%B0%EB%9E%98%EC%B2%98%EC%A0%95%EB%B3%B4%20%EC%96%91%EC%8B%9D.xlsx'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(mockResponse.end).toHaveBeenCalledWith(mockBuffer);
    });

    it('should handle template generation error', async () => {
      const error = new Error('Template generation failed');
      mockTemplateService.generateUploadTemplate.mockRejectedValue(error);

      await expect(controller.downloadTemplate(mockResponse)).rejects.toThrow('Template generation failed');
    });
  });

  describe('downloadExcel', () => {
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
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    it('should download excel with keyword search', async () => {
      const keyword = '테스트';
      const mockSearchResult = {
        data: mockCustomerData,
        total: 1,
        page: 1,
        limit: 10,
      };

      mockSearchService.searchCustomerInfo.mockResolvedValue(mockSearchResult);
      mockDownloadService.exportCustomerInfos.mockResolvedValue(undefined);

      await controller.downloadExcel(mockResponse, keyword, '1', '10');

      expect(mockSearchService.searchCustomerInfo).toHaveBeenCalledWith(keyword, 1, 10);
      expect(mockDownloadService.exportCustomerInfos).toHaveBeenCalledWith(mockCustomerData, mockResponse);
    });

    it('should download excel with all data when no keyword', async () => {
      const mockAllDataResult = {
        data: mockCustomerData,
        total: 1,
        page: 1,
        limit: 99999,
      };

      mockReadService.getAllCustomerInfo.mockResolvedValue(mockAllDataResult);
      mockDownloadService.exportCustomerInfos.mockResolvedValue(undefined);

      await controller.downloadExcel(mockResponse);

      expect(mockReadService.getAllCustomerInfo).toHaveBeenCalledWith(1, 99999);
      expect(mockDownloadService.exportCustomerInfos).toHaveBeenCalledWith(mockCustomerData, mockResponse);
    });

    it('should download excel with custom page and limit', async () => {
      const mockSearchResult = {
        data: mockCustomerData,
        total: 1,
        page: 2,
        limit: 5,
      };

      mockSearchService.searchCustomerInfo.mockResolvedValue(mockSearchResult);
      mockDownloadService.exportCustomerInfos.mockResolvedValue(undefined);

      await controller.downloadExcel(mockResponse, '테스트', '2', '5');

      expect(mockSearchService.searchCustomerInfo).toHaveBeenCalledWith('테스트', 2, 5);
      expect(mockDownloadService.exportCustomerInfos).toHaveBeenCalledWith(mockCustomerData, mockResponse);
    });

    it('should handle empty keyword', async () => {
      const mockAllDataResult = {
        data: mockCustomerData,
        total: 1,
        page: 1,
        limit: 99999,
      };

      mockReadService.getAllCustomerInfo.mockResolvedValue(mockAllDataResult);
      mockDownloadService.exportCustomerInfos.mockResolvedValue(undefined);

      await controller.downloadExcel(mockResponse, '', '1', '10');

      expect(mockReadService.getAllCustomerInfo).toHaveBeenCalledWith(1, 10);
      expect(mockDownloadService.exportCustomerInfos).toHaveBeenCalledWith(mockCustomerData, mockResponse);
    });

    it('should handle whitespace keyword', async () => {
      const mockAllDataResult = {
        data: mockCustomerData,
        total: 1,
        page: 1,
        limit: 99999,
      };

      mockReadService.getAllCustomerInfo.mockResolvedValue(mockAllDataResult);
      mockDownloadService.exportCustomerInfos.mockResolvedValue(undefined);

      await controller.downloadExcel(mockResponse, '   ', '1', '10');

      expect(mockReadService.getAllCustomerInfo).toHaveBeenCalledWith(1, 10);
      expect(mockDownloadService.exportCustomerInfos).toHaveBeenCalledWith(mockCustomerData, mockResponse);
    });

    it('should handle search service error', async () => {
      const error = new Error('Search failed');
      mockSearchService.searchCustomerInfo.mockRejectedValue(error);

      await expect(controller.downloadExcel(mockResponse, '테스트')).rejects.toThrow('Search failed');
      expect(mockDownloadService.exportCustomerInfos).not.toHaveBeenCalled();
    });

    it('should handle read service error', async () => {
      const error = new Error('Read failed');
      mockReadService.getAllCustomerInfo.mockRejectedValue(error);

      await expect(controller.downloadExcel(mockResponse)).rejects.toThrow('Read failed');
      expect(mockDownloadService.exportCustomerInfos).not.toHaveBeenCalled();
    });

    it('should handle download service error', async () => {
      const mockSearchResult = {
        data: mockCustomerData,
        total: 1,
        page: 1,
        limit: 10,
      };

      mockSearchService.searchCustomerInfo.mockResolvedValue(mockSearchResult);
      const error = new Error('Download failed');
      mockDownloadService.exportCustomerInfos.mockRejectedValue(error);

      await expect(controller.downloadExcel(mockResponse, '테스트')).rejects.toThrow('Download failed');
    });
  });
}); 