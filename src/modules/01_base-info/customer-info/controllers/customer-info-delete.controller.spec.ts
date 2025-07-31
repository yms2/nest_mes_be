import { Test, TestingModule } from '@nestjs/testing';
import { CustomerInfoDeleteController } from './customer-info-delete.controller';
import { CustomerInfoDeleteService } from '../services/customer-info-delete.service';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { logService } from '../../../log/Services/log.service';

describe('CustomerInfoDeleteController', () => {
  let controller: CustomerInfoDeleteController;
  let service: CustomerInfoDeleteService;

  const mockDeleteService = {
    hardDeleteCustomerInfo: jest.fn(),
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
      controllers: [CustomerInfoDeleteController],
      providers: [
        {
          provide: CustomerInfoDeleteService,
          useValue: mockDeleteService,
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

    controller = module.get<CustomerInfoDeleteController>(CustomerInfoDeleteController);
    service = module.get<CustomerInfoDeleteService>(CustomerInfoDeleteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteCustomerInfo', () => {
    it('should delete customer info successfully', async () => {
      mockDeleteService.hardDeleteCustomerInfo.mockResolvedValue(undefined);

      const result = await controller.deleteCustomerInfo('1', { user: { username: 'admin' } } as any);

      expect(result).toEqual({
        success: true,
        message: '거래처 정보가 삭제되었습니다.',
        data: null,
        timestamp: expect.any(String),
      });
      expect(mockDeleteService.hardDeleteCustomerInfo).toHaveBeenCalledWith(1);
      expect(mockLogService.createDetailedLog).toHaveBeenCalledWith({
        moduleName: '거래처관리',
        action: 'HARD_DELETE',
        username: 'admin',
        targetId: '1',
        details: '거래처 정보 영구 삭제',
      });
    });

    it('should handle service errors', async () => {
      const errorMessage = '거래처 정보를 찾을 수 없습니다.';
      mockDeleteService.hardDeleteCustomerInfo.mockRejectedValue(new NotFoundException(errorMessage));

      await expect(
        controller.deleteCustomerInfo('999', { user: { username: 'admin' } } as any)
      ).rejects.toThrow(NotFoundException);

      expect(mockDeleteService.hardDeleteCustomerInfo).toHaveBeenCalledWith(999);
      expect(mockLogService.createDetailedLog).toHaveBeenCalledWith({
        moduleName: '거래처관리',
        action: 'HARD_DELETE_FAIL',
        username: 'admin',
        targetId: '999',
        details: `영구 삭제 실패: ${errorMessage}`,
      });
    });

    it('should handle missing user information', async () => {
      mockDeleteService.hardDeleteCustomerInfo.mockResolvedValue(undefined);

      await expect(
        controller.deleteCustomerInfo('1', { user: null } as any)
      ).rejects.toThrow(TypeError);

      // req.user가 null이면 로그 서비스에서 오류가 발생하므로
      // 서비스 호출 여부는 확인하지 않음
    });

    it('should handle different customer IDs', async () => {
      mockDeleteService.hardDeleteCustomerInfo.mockResolvedValue(undefined);

      const result = await controller.deleteCustomerInfo('2', { user: { username: 'admin' } } as any);

      expect(result).toEqual({
        success: true,
        message: '거래처 정보가 삭제되었습니다.',
        data: null,
        timestamp: expect.any(String),
      });
      expect(mockDeleteService.hardDeleteCustomerInfo).toHaveBeenCalledWith(2);
      expect(mockLogService.createDetailedLog).toHaveBeenCalledWith({
        moduleName: '거래처관리',
        action: 'HARD_DELETE',
        username: 'admin',
        targetId: '2',
        details: '거래처 정보 영구 삭제',
      });
    });

    it('should handle string ID conversion', async () => {
      mockDeleteService.hardDeleteCustomerInfo.mockResolvedValue(undefined);

      const result = await controller.deleteCustomerInfo('123', { user: { username: 'admin' } } as any);

      expect(result).toEqual({
        success: true,
        message: '거래처 정보가 삭제되었습니다.',
        data: null,
        timestamp: expect.any(String),
      });
      expect(mockDeleteService.hardDeleteCustomerInfo).toHaveBeenCalledWith(123);
    });



    it('should handle log service errors in error case', async () => {
      const errorMessage = '거래처 정보를 찾을 수 없습니다.';
      mockDeleteService.hardDeleteCustomerInfo.mockRejectedValue(new NotFoundException(errorMessage));
      mockLogService.createDetailedLog.mockRejectedValue(new Error('Log service error'));

      await expect(
        controller.deleteCustomerInfo('999', { user: { username: 'admin' } } as any)
      ).rejects.toThrow(NotFoundException);

      expect(mockDeleteService.hardDeleteCustomerInfo).toHaveBeenCalledWith(999);
      expect(mockLogService.createDetailedLog).toHaveBeenCalledWith({
        moduleName: '거래처관리',
        action: 'HARD_DELETE_FAIL',
        username: 'admin',
        targetId: '999',
        details: `영구 삭제 실패: ${errorMessage}`,
      });
    });
  });
}); 