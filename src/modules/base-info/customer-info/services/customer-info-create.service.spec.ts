import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerInfoCreateService } from './customer-info-create.service';
import { CustomerInfo } from '../entities/customer-info.entity';
import { CreateCustomerInfoDto } from '../dto/customer-info-create.dto';
import { ConflictException } from '@nestjs/common';

describe('CustomerInfoCreateService', () => {
  let service: CustomerInfoCreateService;
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
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerInfoCreateService,
        {
          provide: getRepositoryToken(CustomerInfo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerInfoCreateService>(CustomerInfoCreateService);
    repository = module.get<Repository<CustomerInfo>>(getRepositoryToken(CustomerInfo));
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
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.find.mockResolvedValue([]);
      mockRepository.create.mockReturnValue(mockCustomerInfo);
      mockRepository.save.mockResolvedValue(mockCustomerInfo);

      const result = await service.createCustomerInfo(createDto, 'admin');

      expect(result).toEqual(mockCustomerInfo);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { customerNumber: '1234567890' },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        customerCode: 'C001',
        ...createDto,
        createdBy: 'admin',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockCustomerInfo);
    });

    it('should throw ConflictException when customer number already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomerInfo);

      await expect(service.createCustomerInfo(createDto, 'admin')).rejects.toThrow(
        new ConflictException('사업자 등록번호가 이미 존재합니다.')
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { customerNumber: '1234567890' },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should generate customer code correctly when no existing customers', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.find.mockResolvedValue([]);
      mockRepository.create.mockReturnValue(mockCustomerInfo);
      mockRepository.save.mockResolvedValue(mockCustomerInfo);

      await service.createCustomerInfo(createDto, 'admin');

      expect(mockRepository.create).toHaveBeenCalledWith({
        customerCode: 'C001',
        ...createDto,
        createdBy: 'admin',
      });
    });

    it('should generate customer code correctly when existing customers exist', async () => {
      const existingCustomer = { ...mockCustomerInfo, customerCode: 'C005' };
      
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.find.mockResolvedValue([existingCustomer]);
      mockRepository.create.mockReturnValue(mockCustomerInfo);
      mockRepository.save.mockResolvedValue(mockCustomerInfo);

      await service.createCustomerInfo(createDto, 'admin');

      expect(mockRepository.create).toHaveBeenCalledWith({
        customerCode: 'C006',
        ...createDto,
        createdBy: 'admin',
      });
    });

    it('should handle partial DTO with only required fields', async () => {
      const minimalDto: CreateCustomerInfoDto = {
        customerNumber: '1234567890',
        customerName: '테스트 거래처',
        customerCeo: '홍길동',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.find.mockResolvedValue([]);
      mockRepository.create.mockReturnValue(mockCustomerInfo);
      mockRepository.save.mockResolvedValue(mockCustomerInfo);

      const result = await service.createCustomerInfo(minimalDto, 'admin');

      expect(result).toEqual(mockCustomerInfo);
      expect(mockRepository.create).toHaveBeenCalledWith({
        customerCode: 'C001',
        ...minimalDto,
        createdBy: 'admin',
      });
    });
  });
}); 