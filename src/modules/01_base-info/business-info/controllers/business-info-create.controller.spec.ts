import { Test, TestingModule } from '@nestjs/testing';
import { BusinessInfoCreateController } from './business-info-create.controller';
import { BusinessInfoCreateService } from '../services/business-info-create.service';
import { CreateBusinessInfoDto } from '../dto/create-business-info.dto';
import { BusinessInfo } from '../entities/business-info.entity';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { logService } from '../../../log/Services/log.service';

describe('BusinessInfoCreateController', () => {
  let controller: BusinessInfoCreateController;
  let service: BusinessInfoCreateService;

  const mockBusinessInfo: BusinessInfo = {
    id: 1,
    businessCode: 'BUS001',
    businessNumber: '1234567890',
    businessName: '테스트 사업장',
    businessCeo: '홍길동',
    corporateRegistrationNumber: '1234567890123',
    businessType: '제조업',
    businessItem: '자동차 제조업',
    businessTel: '02-1234-5678',
    businessMobile: '010-1234-5678',
    businessFax: '02-1234-5679',
    businessZipcode: '12345',
    businessAddress: '서울시 강남구',
    businessAddressDetail: '123-45',
    businessCeoEmail: 'test@test.com',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isDeleted: false,
    deletedAt: null,
  };

  const mockCreateService = {
    createBusinessInfo: jest.fn(),
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
      controllers: [BusinessInfoCreateController],
      providers: [
        {
          provide: BusinessInfoCreateService,
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

    controller = module.get<BusinessInfoCreateController>(BusinessInfoCreateController);
    service = module.get<BusinessInfoCreateService>(BusinessInfoCreateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBusinessInfo', () => {
    const createDto: CreateBusinessInfoDto = {
      businessNumber: '1234567890',
      businessName: '테스트 사업장',
      businessCeo: '홍길동',
      corporateRegistrationNumber: '1234567890123',
      businessType: '제조업',
      businessItem: '자동차 제조업',
      businessTel: '02-1234-5678',
      businessMobile: '010-1234-5678',
      businessFax: '02-1234-5679',
      businessZipcode: '12345',
      businessAddress: '서울시 강남구',
      businessAddressDetail: '123-45',
      businessCeoEmail: 'test@test.com',
    };

    it('should create business info successfully', async () => {
      mockCreateService.createBusinessInfo.mockResolvedValue(mockBusinessInfo);

      const result = await controller.createBusinessInfo(createDto, { user: { username: 'admin' } } as any);

      expect(result).toEqual({
        success: true,
        message: '사업장 정보 등록되었습니다.',
        data: mockBusinessInfo,
        timestamp: expect.any(String),
      });
      expect(mockCreateService.createBusinessInfo).toHaveBeenCalledWith(createDto, 'admin');
    });

    it('should handle service errors', async () => {
      const errorMessage = '사업자 번호가 이미 존재합니다.';
      mockCreateService.createBusinessInfo.mockRejectedValue(new BadRequestException(errorMessage));

      await expect(
        controller.createBusinessInfo(createDto, { user: { username: 'admin' } } as any)
      ).rejects.toThrow(BadRequestException);

      expect(mockCreateService.createBusinessInfo).toHaveBeenCalledWith(createDto, 'admin');
    });

    it('should handle missing user information', async () => {
      mockCreateService.createBusinessInfo.mockResolvedValue(mockBusinessInfo);

      await expect(
        controller.createBusinessInfo(createDto, { user: null } as any)
      ).rejects.toThrow(TypeError);

      expect(mockCreateService.createBusinessInfo).not.toHaveBeenCalled();
    });

    it('should handle partial DTO with only required fields', async () => {
      const minimalDto: CreateBusinessInfoDto = {
        businessNumber: '1234567890',
        businessName: '테스트 사업장',
        businessCeo: '홍길동',
      };

      mockCreateService.createBusinessInfo.mockResolvedValue(mockBusinessInfo);

      const result = await controller.createBusinessInfo(minimalDto, { user: { username: 'admin' } } as any);

      expect(result).toEqual({
        success: true,
        message: '사업장 정보 등록되었습니다.',
        data: mockBusinessInfo,
        timestamp: expect.any(String),
      });
      expect(mockCreateService.createBusinessInfo).toHaveBeenCalledWith(minimalDto, 'admin');
    });
  });
}); 