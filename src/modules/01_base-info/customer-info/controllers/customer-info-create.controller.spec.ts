import { Test, TestingModule } from '@nestjs/testing';
import { CustomerInfoCreateController } from './customer-info-create.controller';
import { CustomerInfoCreateService } from '../services/customer-info-create.service';
import { CreateCustomerInfoDto } from '../dto/customer-info-create.dto';
import { CustomerInfo } from '../entities/customer-info.entity';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { logService } from '../../../log/Services/log.service';

describe('CustomerInfoCreateController', () => {
  let controller: CustomerInfoCreateController;
  let service: CustomerInfoCreateService;

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

  const mockCreateService = {
    createCustomerInfo: jest.fn(),
  };

  const mockLogService = {
    createDetailedLog: jest.fn().mockResolvedValue(undefined),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerInfoCreateController],
      providers: [
        {
          provide: CustomerInfoCreateService,
          useValue: mockCreateService,
        },
        {
          provide: logService,
          useValue: mockLogService,
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

    controller = module.get<CustomerInfoCreateController>(CustomerInfoCreateController);
    service = module.get<CustomerInfoCreateService>(CustomerInfoCreateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomerInfo', () => {
    const createDto: CreateCustomerInfoDto = {
      customerNumber: '1234567890',
      customerName: '테스트 거래처',
      customerCeo: '홍길동',
      customerBusinessType: '제조업',
      customerBusinessItem: '자동차 제조업',
      customerTel: '02-1234-5678',
      customerMobile: '010-1234-5678',
      customerEmail: 'test@test.com',
      customerZipcode: '12345',
      customerAddress: '서울시 강남구',
      customerAddressDetail: '123-45',
    };

    it('should create customer info successfully', async () => {
      mockCreateService.createCustomerInfo.mockResolvedValue(mockCustomerInfo);

      const result = await controller.createCustomerInfo(createDto, { user: { username: 'admin' } } as any);

      expect(result).toEqual({
        success: true,
        message: '거래처 정보 등록되었습니다.',
        data: mockCustomerInfo,
        timestamp: expect.any(String),
      });
      expect(mockCreateService.createCustomerInfo).toHaveBeenCalledWith(createDto, 'admin');
    });

    it('should handle service errors', async () => {
      const errorMessage = '사업자 등록번호가 이미 존재합니다.';
      mockCreateService.createCustomerInfo.mockRejectedValue(new ConflictException(errorMessage));

      await expect(
        controller.createCustomerInfo(createDto, { user: { username: 'admin' } } as any)
      ).rejects.toThrow(ConflictException);

      expect(mockCreateService.createCustomerInfo).toHaveBeenCalledWith(createDto, 'admin');
    });

    it('should handle missing user information', async () => {
      mockCreateService.createCustomerInfo.mockResolvedValue(mockCustomerInfo);

      await expect(
        controller.createCustomerInfo(createDto, { user: null } as any)
      ).rejects.toThrow(TypeError);

      expect(mockCreateService.createCustomerInfo).not.toHaveBeenCalled();
    });

    it('should handle partial DTO with only required fields', async () => {
      const minimalDto: CreateCustomerInfoDto = {
        customerNumber: '1234567890',
        customerName: '테스트 거래처',
        customerCeo: '홍길동',
      };

      mockCreateService.createCustomerInfo.mockResolvedValue(mockCustomerInfo);

      const result = await controller.createCustomerInfo(minimalDto, { user: { username: 'admin' } } as any);

      expect(result).toEqual({
        success: true,
        message: '거래처 정보 등록되었습니다.',
        data: mockCustomerInfo,
        timestamp: expect.any(String),
      });
      expect(mockCreateService.createCustomerInfo).toHaveBeenCalledWith(minimalDto, 'admin');
    });
  });
}); 