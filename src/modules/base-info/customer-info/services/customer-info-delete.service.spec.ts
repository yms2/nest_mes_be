import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerInfoDeleteService } from './customer-info-delete.service';
import { CustomerInfo } from '../entities/customer-info.entity';
import { NotFoundException } from '@nestjs/common';

describe('CustomerInfoDeleteService', () => {
  let service: CustomerInfoDeleteService;
  let repository: Repository<CustomerInfo>;

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

  const mockRepository = {
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerInfoDeleteService,
        {
          provide: getRepositoryToken(CustomerInfo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerInfoDeleteService>(CustomerInfoDeleteService);
    repository = module.get<Repository<CustomerInfo>>(getRepositoryToken(CustomerInfo));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hardDeleteCustomerInfo', () => {
    it('should delete customer info successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomerInfo);
      mockRepository.remove.mockResolvedValue(mockCustomerInfo);

      await service.hardDeleteCustomerInfo(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockCustomerInfo);
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.hardDeleteCustomerInfo(999)).rejects.toThrow(
        new NotFoundException('거래처 정보를 찾을 수 없습니다.')
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });

    it('should handle different customer IDs', async () => {
      const differentCustomer = { ...mockCustomerInfo, id: 2, customerName: '다른 거래처' };
      mockRepository.findOne.mockResolvedValue(differentCustomer);
      mockRepository.remove.mockResolvedValue(differentCustomer);

      await service.hardDeleteCustomerInfo(2);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(differentCustomer);
    });

    it('should handle repository errors', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomerInfo);
      mockRepository.remove.mockRejectedValue(new Error('Database error'));

      await expect(service.hardDeleteCustomerInfo(1)).rejects.toThrow('Database error');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockCustomerInfo);
    });

    it('should handle multiple deletions', async () => {
      const customer1 = { ...mockCustomerInfo, id: 1 };
      const customer2 = { ...mockCustomerInfo, id: 2, customerName: '거래처 2' };

      // First deletion
      mockRepository.findOne.mockResolvedValueOnce(customer1);
      mockRepository.remove.mockResolvedValueOnce(customer1);

      await service.hardDeleteCustomerInfo(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(customer1);

      // Second deletion
      mockRepository.findOne.mockResolvedValueOnce(customer2);
      mockRepository.remove.mockResolvedValueOnce(customer2);

      await service.hardDeleteCustomerInfo(2);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(customer2);
    });

    it('should handle zero ID', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.hardDeleteCustomerInfo(0)).rejects.toThrow(
        new NotFoundException('거래처 정보를 찾을 수 없습니다.')
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 0 },
      });
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });

    it('should handle negative ID', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.hardDeleteCustomerInfo(-1)).rejects.toThrow(
        new NotFoundException('거래처 정보를 찾을 수 없습니다.')
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: -1 },
      });
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
}); 