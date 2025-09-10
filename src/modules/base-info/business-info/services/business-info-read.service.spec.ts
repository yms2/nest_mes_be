import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInfoReadService } from './business-info-read.service';
import { BusinessInfo } from '../entities/business-info.entity';

describe('BusinessInfoReadService', () => {
  let service: BusinessInfoReadService;
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

  // DateFormatter가 적용된 후의 예상 결과
  const mockFormattedBusinessInfo = {
    ...mockBusinessInfo,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getOne: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessInfoReadService,
        {
          provide: getRepositoryToken(BusinessInfo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BusinessInfoReadService>(BusinessInfoReadService);
    repository = module.get<Repository<BusinessInfo>>(getRepositoryToken(BusinessInfo));

    // DateFormatter 모킹
    const DateFormatter = require('../../../../common/utils/date-formatter.util').DateFormatter;
    jest.spyOn(DateFormatter, 'formatBusinessInfoDates').mockImplementation((data: any) => ({
      ...data,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }));
    jest.spyOn(DateFormatter, 'formatBusinessInfoArrayDates').mockImplementation((data: any[]) => 
      data.map(item => ({
        ...item,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }))
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBusinessInfo', () => {
    it('should return all business info with pagination', async () => {
      const mockData = [mockBusinessInfo];
      const mockTotal = 1;
      
      const queryBuilder = repository.createQueryBuilder as jest.MockedFunction<any>;
      queryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockData, mockTotal]),
      });

      const result = await service.getAllBusinessInfo(1, 10);

      expect(result).toEqual({
        data: [mockFormattedBusinessInfo],
        total: mockTotal,
        page: 1,
        limit: 10,
      });
    });

    it('should return empty array when no data exists', async () => {
      const queryBuilder = repository.createQueryBuilder as jest.MockedFunction<any>;
      queryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      });

      const result = await service.getAllBusinessInfo(1, 10);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getBusinessInfoByNumber', () => {
    it('should return business info by business number', async () => {
      mockRepository.findOne.mockResolvedValue(mockBusinessInfo);

      const result = await service.getBusinessInfoByNumber({ businessNumber: '1234567890', page: 1, limit: 10 });

      expect(result).toEqual(mockFormattedBusinessInfo);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { businessNumber: '1234567890' },
      });
    });

    it('should throw NotFoundException when business info not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getBusinessInfoByNumber({ businessNumber: '9999999999', page: 1, limit: 10 })
      ).rejects.toThrow('사업장 정보를 찾을 수 없습니다.');
    });
  });


}); 