import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInfoCreateService } from './business-info-create.service';
import { BusinessInfo } from '../entities/business-info.entity';
import { CreateBusinessInfoDto } from '../dto/create-business-info.dto';
import { BadRequestException } from '@nestjs/common';

describe('BusinessInfoCreateService', () => {
  let service: BusinessInfoCreateService;
  let repository: Repository<BusinessInfo>;

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

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessInfoCreateService,
        {
          provide: getRepositoryToken(BusinessInfo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BusinessInfoCreateService>(BusinessInfoCreateService);
    repository = module.get<Repository<BusinessInfo>>(getRepositoryToken(BusinessInfo));
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
      // Mock existing business check
      mockRepository.findOne.mockResolvedValue(null);
      
      // Mock business code generation
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock create and save
      mockRepository.create.mockReturnValue(mockBusinessInfo);
      mockRepository.save.mockResolvedValue(mockBusinessInfo);

      const result = await service.createBusinessInfo(createDto, 'admin');

      expect(result).toEqual(mockBusinessInfo);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { businessNumber: '1234567890' },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          businessNumber: '1234567890',
          businessName: '테스트 사업장',
          businessCeo: '홍길동',
          createdBy: 'admin',
        })
      );
      expect(mockRepository.save).toHaveBeenCalledWith(mockBusinessInfo);
    });

    it('should throw BadRequestException when business number already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockBusinessInfo);

      await expect(
        service.createBusinessInfo(createDto, 'admin')
      ).rejects.toThrow(BadRequestException);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { businessNumber: '1234567890' },
      });
    });

    it('should generate business code correctly', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      // Mock existing business codes
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ businessCode: 'BUS999' }),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      mockRepository.save.mockResolvedValue(mockBusinessInfo);

      await service.createBusinessInfo(createDto, 'admin');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          businessCode: expect.stringMatching(/^BUS\d+$/),
        })
      );
    });

    it('should handle missing optional fields', async () => {
      const minimalDto: CreateBusinessInfoDto = {
        businessNumber: '1234567890',
        businessName: '테스트 사업장',
        businessCeo: '홍길동',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockBusinessInfo);
      mockRepository.save.mockResolvedValue(mockBusinessInfo);

      const result = await service.createBusinessInfo(minimalDto, 'admin');

      expect(result).toEqual(mockBusinessInfo);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          businessNumber: '1234567890',
          businessName: '테스트 사업장',
          businessCeo: '홍길동',
          createdBy: 'admin',
        })
      );
    });
  });



  describe('generateBusinessCode', () => {
    it('should generate business code with correct format', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const code = await service['generateBusinessCode']();

      expect(code).toMatch(/^BUS\d+$/);
      expect(code.length).toBeGreaterThanOrEqual(6); // BUS + at least 3 digits
    });

    it('should generate sequential business codes', async () => {
      mockRepository.findOne.mockResolvedValue({ businessCode: 'BUS999' });

      const code = await service['generateBusinessCode']();

      expect(code).toMatch(/^BUS\d+$/);
      expect(parseInt(code.substring(3))).toBeGreaterThan(999);
    });
  });
}); 