import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerInfoReadService } from './customer-info-read.service';
import { CustomerInfo } from '../entities/customer-info.entity';
import { SearchCustomerInfoDto } from '../dto/customer-info-search.dto';
import { NotFoundException } from '@nestjs/common';

describe('CustomerInfoReadService', () => {
  let service: CustomerInfoReadService;
  let repository: Repository<CustomerInfo>;

  const mockCustomerInfo: CustomerInfo = {
    id: 1,
    customerCode: 'C001',
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
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerInfoReadService,
        {
          provide: getRepositoryToken(CustomerInfo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerInfoReadService>(CustomerInfoReadService);
    repository = module.get<Repository<CustomerInfo>>(getRepositoryToken(CustomerInfo));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomerInfoByNumber', () => {
    const searchDto: SearchCustomerInfoDto = {
      customerNumber: '1234567890',
      page: 1,
      limit: 10,
    };

    it('should return customer info when found', async () => {
      const formattedCustomerInfo = {
        ...mockCustomerInfo,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        deletedAt: null,
      };
      mockRepository.findOne.mockResolvedValue(mockCustomerInfo);

      const result = await service.getCustomerInfoByNumber(searchDto);

      expect(result).toEqual(formattedCustomerInfo);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { customerNumber: '1234567890' },
      });
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getCustomerInfoByNumber(searchDto)).rejects.toThrow(
        new NotFoundException('거래처 정보를 찾을 수 없습니다.')
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { customerNumber: '1234567890' },
      });
    });

    it('should handle different customer numbers', async () => {
      const differentSearchDto: SearchCustomerInfoDto = {
        customerNumber: '9876543210',
        page: 1,
        limit: 10,
      };

      const differentCustomer = { ...mockCustomerInfo, customerNumber: '9876543210' };
      const formattedDifferentCustomer = {
        ...differentCustomer,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        deletedAt: null,
      };
      mockRepository.findOne.mockResolvedValue(differentCustomer);

      const result = await service.getCustomerInfoByNumber(differentSearchDto);

      expect(result).toEqual(formattedDifferentCustomer);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { customerNumber: '9876543210' },
      });
    });
  });

  describe('getAllCustomerInfo', () => {
    it('should return paginated customer list with default values', async () => {
      const mockData = [mockCustomerInfo];
      const mockTotal = 1;

      mockRepository.findAndCount.mockResolvedValue([mockData, mockTotal]);

      const result = await service.getAllCustomerInfo();

      expect(result).toEqual({
        data: mockData,
        total: mockTotal,
        page: 1,
        limit: 10,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        order: { customerName: 'ASC' },
        skip: 0,
        take: 10,
      });
    });

    it('should return paginated customer list with custom values', async () => {
      const mockData = [mockCustomerInfo];
      const mockTotal = 1;
      const page = 2;
      const limit = 5;

      mockRepository.findAndCount.mockResolvedValue([mockData, mockTotal]);

      const result = await service.getAllCustomerInfo(page, limit);

      expect(result).toEqual({
        data: mockData,
        total: mockTotal,
        page: 2,
        limit: 5,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        order: { customerName: 'ASC' },
        skip: 5,
        take: 5,
      });
    });

    it('should handle empty result', async () => {
      const mockData: CustomerInfo[] = [];
      const mockTotal = 0;

      mockRepository.findAndCount.mockResolvedValue([mockData, mockTotal]);

      const result = await service.getAllCustomerInfo(1, 10);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        order: { customerName: 'ASC' },
        skip: 0,
        take: 10,
      });
    });

    it('should handle multiple customers', async () => {
      const mockData = [
        mockCustomerInfo,
        { ...mockCustomerInfo, id: 2, customerCode: 'C002', customerName: '테스트 거래처 2' },
        { ...mockCustomerInfo, id: 3, customerCode: 'C003', customerName: '테스트 거래처 3' },
      ];
      const mockTotal = 3;

      mockRepository.findAndCount.mockResolvedValue([mockData, mockTotal]);

      const result = await service.getAllCustomerInfo(1, 10);

      expect(result).toEqual({
        data: mockData,
        total: 3,
        page: 1,
        limit: 10,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        order: { customerName: 'ASC' },
        skip: 0,
        take: 10,
      });
    });

    it('should calculate offset correctly for different pages', async () => {
      const mockData = [mockCustomerInfo];
      const mockTotal = 1;

      mockRepository.findAndCount.mockResolvedValue([mockData, mockTotal]);

      await service.getAllCustomerInfo(3, 5);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        order: { customerName: 'ASC' },
        skip: 10, // (3-1) * 5
        take: 5,
      });
    });
  });
}); 