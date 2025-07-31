import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerInfoUpdateService } from './customer-info-update.service';
import { CustomerInfo } from '../entities/customer-info.entity';
import { CreateCustomerInfoDto } from '../dto/customer-info-create.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CustomerInfoUpdateService', () => {
  let service: CustomerInfoUpdateService;
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
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerInfoUpdateService,
        {
          provide: getRepositoryToken(CustomerInfo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerInfoUpdateService>(CustomerInfoUpdateService);
    repository = module.get<Repository<CustomerInfo>>(getRepositoryToken(CustomerInfo));
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
      const updatedCustomerInfo = {
        ...mockCustomerInfo,
        ...updateDto,
        updatedBy: 'admin',
        updatedAt: expect.any(Date),
      };

      mockRepository.findOne.mockResolvedValue(mockCustomerInfo);
      mockRepository.save.mockResolvedValue(updatedCustomerInfo);

      const result = await service.updateCustomerInfo(1, updateDto, 'admin');

      expect(result).toEqual(updatedCustomerInfo);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockCustomerInfo,
        ...updateDto,
        updatedBy: 'admin',
        updatedAt: expect.any(Date),
      });
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateCustomerInfo(999, updateDto, 'admin')).rejects.toThrow(
        new NotFoundException('거래처 정보를 찾을 수 없습니다.')
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should handle customer number change with duplicate check', async () => {
      const differentCustomerNumber = '9876543210';
      const updateDtoWithNewNumber = { ...updateDto, customerNumber: differentCustomerNumber };
      
      // 첫 번째 호출: findCustomerInfoById - 기존 고객 정보 반환
      // 두 번째 호출: checkCustomerNumberDuplicate - 중복 없음 (null 반환)
      mockRepository.findOne
        .mockResolvedValueOnce(mockCustomerInfo) // findCustomerInfoById
        .mockResolvedValueOnce(null); // checkCustomerNumberDuplicate - 중복 없음

      const updatedCustomerInfo = {
        ...mockCustomerInfo,
        ...updateDtoWithNewNumber,
        updatedBy: 'admin',
        updatedAt: expect.any(Date),
      };

      mockRepository.save.mockResolvedValue(updatedCustomerInfo);

      const result = await service.updateCustomerInfo(1, updateDtoWithNewNumber, 'admin');

      expect(result).toEqual(updatedCustomerInfo);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException when customer number already exists', async () => {
      const differentCustomerNumber = '9876543210';
      const updateDtoWithNewNumber = { ...updateDto, customerNumber: differentCustomerNumber };
      
      const existingCustomerWithNewNumber = { ...mockCustomerInfo, id: 2, customerNumber: differentCustomerNumber };
      
      mockRepository.findOne
        .mockResolvedValueOnce(mockCustomerInfo) // findCustomerInfoById
        .mockResolvedValueOnce(existingCustomerWithNewNumber); // checkCustomerNumberDuplicate

      await expect(service.updateCustomerInfo(1, updateDtoWithNewNumber, 'admin')).rejects.toThrow(
        new BadRequestException('이미 등록된 거래처입니다.')
      );

      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should allow updating same customer with same customer number', async () => {
      const updateDtoWithSameNumber = { ...updateDto, customerNumber: '1234567890' };
      
      // 같은 고객 번호로 업데이트할 때는 중복 검사를 하지 않음
      // customerNumber가 변경되지 않았으므로 checkCustomerNumberDuplicate가 호출되지 않음
      mockRepository.findOne.mockResolvedValue(mockCustomerInfo); // findCustomerInfoById만 호출

      const updatedCustomerInfo = {
        ...mockCustomerInfo,
        ...updateDtoWithSameNumber,
        updatedBy: 'admin',
        updatedAt: expect.any(Date),
      };

      mockRepository.save.mockResolvedValue(updatedCustomerInfo);

      const result = await service.updateCustomerInfo(1, updateDtoWithSameNumber, 'admin');

      expect(result).toEqual(updatedCustomerInfo);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1); // findCustomerInfoById만 호출됨
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should handle partial update with only required fields', async () => {
      const minimalDto: CreateCustomerInfoDto = {
        customerNumber: '1234567890',
        customerName: '수정된 거래처',
        customerCeo: '김철수',
      };

      const updatedCustomerInfo = {
        ...mockCustomerInfo,
        ...minimalDto,
        updatedBy: 'admin',
        updatedAt: expect.any(Date),
      };

      mockRepository.findOne.mockResolvedValue(mockCustomerInfo);
      mockRepository.save.mockResolvedValue(updatedCustomerInfo);

      const result = await service.updateCustomerInfo(1, minimalDto, 'admin');

      expect(result).toEqual(updatedCustomerInfo);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockCustomerInfo,
        ...minimalDto,
        updatedBy: 'admin',
        updatedAt: expect.any(Date),
      });
    });

    it('should handle different customer IDs', async () => {
      const differentCustomer = { ...mockCustomerInfo, id: 2, customerName: '다른 거래처' };
      const updatedCustomerInfo = {
        ...differentCustomer,
        ...updateDto,
        updatedBy: 'admin',
        updatedAt: expect.any(Date),
      };

      mockRepository.findOne.mockResolvedValue(differentCustomer);
      mockRepository.save.mockResolvedValue(updatedCustomerInfo);

      const result = await service.updateCustomerInfo(2, updateDto, 'admin');

      expect(result).toEqual(updatedCustomerInfo);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...differentCustomer,
        ...updateDto,
        updatedBy: 'admin',
        updatedAt: expect.any(Date),
      });
    });
  });
}); 