import { Test, TestingModule } from '@nestjs/testing';
import { CustomerInfoUpdateController } from './customer-info-update.controller';
import { CustomerInfoUpdateService } from '../services/customer-info-update.service';
import { CreateCustomerInfoDto } from '../dto/customer-info-create.dto';
import { CustomerInfo } from '../entities/customer-info.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { logService } from '../../../log/Services/log.service';

describe('CustomerInfoUpdateController', () => {
  let controller: CustomerInfoUpdateController;
  let service: CustomerInfoUpdateService;

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

  const mockUpdateService = {
    updateCustomerInfo: jest.fn(),
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
      controllers: [CustomerInfoUpdateController],
      providers: [
        {
          provide: CustomerInfoUpdateService,
          useValue: mockUpdateService,
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

    controller = module.get<CustomerInfoUpdateController>(CustomerInfoUpdateController);
    service = module.get<CustomerInfoUpdateService>(CustomerInfoUpdateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateCustomerInfo', () => {
    const updateDto: CreateCustomerInfoDto = {
      customerNumber: '1234567890',
      customerName: '수정된 거래처',
      customerCeo: '김철수',
      customerBusinessType: '서비스업',
      customerBusinessItem: 'IT 서비스업',
      customerTel: '02-9876-5432',
      customerMobile: '010-9876-5432',
      customerEmail: 'updated@test.com',
      customerZipcode: '54321',
      customerAddress: '서울시 서초구',
      customerAddressDetail: '456-78',
    };

    it('should update customer info successfully', async () => {
      const updatedCustomerInfo = { ...mockCustomerInfo, ...updateDto };
      mockUpdateService.updateCustomerInfo.mockResolvedValue(updatedCustomerInfo);

      const result = await controller.updateCustomerInfo(
        1,
        updateDto,
        { user: { username: 'admin' } } as any
      );

      expect(result).toEqual({
        success: true,
        message: '거래처 정보가 수정되었습니다.',
        data: updatedCustomerInfo,
        timestamp: expect.any(String),
      });
      expect(mockUpdateService.updateCustomerInfo).toHaveBeenCalledWith(1, updateDto, 'admin');
    });

    it('should handle service errors', async () => {
      const errorMessage = '거래처 정보를 찾을 수 없습니다.';
      mockUpdateService.updateCustomerInfo.mockRejectedValue(new NotFoundException(errorMessage));

      await expect(
        controller.updateCustomerInfo(999, updateDto, { user: { username: 'admin' } } as any)
      ).rejects.toThrow(NotFoundException);

      expect(mockUpdateService.updateCustomerInfo).toHaveBeenCalledWith(999, updateDto, 'admin');
    });

    it('should handle duplicate customer number error', async () => {
      const errorMessage = '이미 등록된 거래처입니다.';
      mockUpdateService.updateCustomerInfo.mockRejectedValue(new BadRequestException(errorMessage));

      await expect(
        controller.updateCustomerInfo(1, updateDto, { user: { username: 'admin' } } as any)
      ).rejects.toThrow(BadRequestException);

      expect(mockUpdateService.updateCustomerInfo).toHaveBeenCalledWith(1, updateDto, 'admin');
    });

    it('should handle missing user information', async () => {
      mockUpdateService.updateCustomerInfo.mockResolvedValue(mockCustomerInfo);

      await expect(
        controller.updateCustomerInfo(1, updateDto, { user: null } as any)
      ).rejects.toThrow(TypeError);

      expect(mockUpdateService.updateCustomerInfo).not.toHaveBeenCalled();
    });

    it('should handle partial update with only required fields', async () => {
      const minimalDto: CreateCustomerInfoDto = {
        customerNumber: '1234567890',
        customerName: '수정된 거래처',
        customerCeo: '김철수',
      };

      const updatedCustomerInfo = { ...mockCustomerInfo, ...minimalDto };
      mockUpdateService.updateCustomerInfo.mockResolvedValue(updatedCustomerInfo);

      const result = await controller.updateCustomerInfo(
        1,
        minimalDto,
        { user: { username: 'admin' } } as any
      );

      expect(result).toEqual({
        success: true,
        message: '거래처 정보가 수정되었습니다.',
        data: updatedCustomerInfo,
        timestamp: expect.any(String),
      });
      expect(mockUpdateService.updateCustomerInfo).toHaveBeenCalledWith(1, minimalDto, 'admin');
    });

    it('should handle different customer IDs', async () => {
      const updatedCustomerInfo = { ...mockCustomerInfo, id: 2, customerName: '다른 거래처' };
      mockUpdateService.updateCustomerInfo.mockResolvedValue(updatedCustomerInfo);

      const result = await controller.updateCustomerInfo(
        2,
        updateDto,
        { user: { username: 'admin' } } as any
      );

      expect(result).toEqual({
        success: true,
        message: '거래처 정보가 수정되었습니다.',
        data: updatedCustomerInfo,
        timestamp: expect.any(String),
      });
      expect(mockUpdateService.updateCustomerInfo).toHaveBeenCalledWith(2, updateDto, 'admin');
    });
  });
}); 