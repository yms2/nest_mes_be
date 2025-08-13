import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CustomerUploadService } from './customer-upload.service';
import { CustomerUploadValidationService } from './customer-upload-validation.service';
import { CustomerUploadProcessingService } from './customer-upload-processing.service';
import { CustomerExcelRow, ValidationResult } from './customer-upload-validation.service';
import { ProcessingResult } from './customer-upload-processing.service';
import { CustomerInfo } from '../../entities/customer-info.entity';

describe('CustomerUploadService', () => {
  let service: CustomerUploadService;
  let validationService: CustomerUploadValidationService;
  let processingService: CustomerUploadProcessingService;

  const mockCustomerInfo: CustomerInfo = {
    id: 1,
    customerCode: 'CUS001',
    customerName: '기존 거래처',
    customerCeo: '김철수',
    customerNumber: '1234567890',
    customerCorporateRegistrationNumber: '1234567890123',
    customerType: '매입',
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

  const mockExcelRows: CustomerExcelRow[] = [
    {
      거래처명: '테스트 거래처',
      사업자등록번호: '1234567890',
      대표자명: '홍길동',
      법인번호: '1234567890123',
      거래구분: '매입',
      업태: '제조업',
      종목: '자동차 제조업',
      전화번호: '02-1234-5678',
      휴대전화: '010-1234-5678',
      FAX: '02-1234-5679',
      '대표자 이메일': 'test@test.com',
      '계산서 이메일': 'invoice@test.com',
      우편번호: '12345',
      주소: '서울시 강남구',
      상세주소: '123-45',
    }
  ];

  const mockValidationResult: ValidationResult = {
    message: '검증이 완료되었습니다.',
    result: {
      totalCount: 1,
      duplicateCount: 0,
      newCount: 1,
      errorCount: 0,
      hasDuplicates: false,
      hasErrors: false,
      duplicates: [],
      errors: [],
      preview: {
        toCreate: [
          {
            customerName: '테스트 거래처',
            customerNumber: '1234567890',
            customerCeo: '홍길동',
          }
        ],
        toUpdate: [],
      },
    },
  };

  const mockProcessingResult: ProcessingResult = {
    message: '업로드가 완료되었습니다.',
    result: {
      successCount: 1,
      failCount: 0,
      totalCount: 1,
      errors: [],
      summary: {
        created: 1,
        updated: 0,
        skipped: 0,
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerUploadService,
        {
          provide: CustomerUploadValidationService,
          useValue: {
            parseExcelFile: jest.fn(),
            validateRows: jest.fn(),
          },
        },
        {
          provide: CustomerUploadProcessingService,
          useValue: {
            loadExistingData: jest.fn(),
            processRows: jest.fn(),
            saveData: jest.fn(),
            createResponse: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CustomerUploadService>(CustomerUploadService);
    validationService = module.get<CustomerUploadValidationService>(CustomerUploadValidationService);
    processingService = module.get<CustomerUploadProcessingService>(CustomerUploadProcessingService);
  });

  describe('processExcel', () => {
    it('should process excel file successfully', async () => {
      const mockBuffer = Buffer.from('mock excel data');
      const mockCustomerNumberMap = new Map<string, CustomerInfo>();
      const mockNextCodeNumber = 2;

      jest.spyOn(validationService, 'parseExcelFile').mockReturnValue(mockExcelRows);
      jest.spyOn(processingService, 'loadExistingData').mockResolvedValue({
        customerNumberMap: mockCustomerNumberMap,
        nextCodeNumber: mockNextCodeNumber,
      });
      jest.spyOn(processingService, 'processRows').mockResolvedValue({
        toCreate: [mockCustomerInfo],
        toUpdate: [],
        errors: [],
        successCount: 1,
        failCount: 0,
      });
      jest.spyOn(processingService, 'saveData').mockResolvedValue();
      jest.spyOn(processingService, 'createResponse').mockReturnValue(mockProcessingResult);

      const result = await service.processExcel(mockBuffer, 'add');

      expect(validationService.parseExcelFile).toHaveBeenCalledWith(mockBuffer);
      expect(processingService.loadExistingData).toHaveBeenCalled();
      expect(processingService.processRows).toHaveBeenCalledWith(
        mockExcelRows,
        mockCustomerNumberMap,
        mockNextCodeNumber,
        'add',
        'system'
      );
      expect(processingService.saveData).toHaveBeenCalled();
      expect(processingService.createResponse).toHaveBeenCalled();
      expect(result).toEqual(mockProcessingResult);
    });

    it('should process excel file with overwrite mode', async () => {
      const mockBuffer = Buffer.from('mock excel data');
      const mockCustomerNumberMap = new Map<string, CustomerInfo>();
      const mockNextCodeNumber = 2;

      jest.spyOn(validationService, 'parseExcelFile').mockReturnValue(mockExcelRows);
      jest.spyOn(processingService, 'loadExistingData').mockResolvedValue({
        customerNumberMap: mockCustomerNumberMap,
        nextCodeNumber: mockNextCodeNumber,
      });
      jest.spyOn(processingService, 'processRows').mockResolvedValue({
        toCreate: [],
        toUpdate: [mockCustomerInfo],
        errors: [],
        successCount: 1,
        failCount: 0,
      });
      jest.spyOn(processingService, 'saveData').mockResolvedValue();
      jest.spyOn(processingService, 'createResponse').mockReturnValue(mockProcessingResult);

      const result = await service.processExcel(mockBuffer, 'overwrite');

      expect(processingService.processRows).toHaveBeenCalledWith(
        mockExcelRows,
        mockCustomerNumberMap,
        mockNextCodeNumber,
        'overwrite',
        'system'
      );
      expect(result).toEqual(mockProcessingResult);
    });
  });

  describe('validateExcel', () => {
    it('should validate excel file and return session id', async () => {
      const mockBuffer = Buffer.from('mock excel data');
      const mockCustomerNumberMap = new Map<string, CustomerInfo>();

      jest.spyOn(validationService, 'parseExcelFile').mockReturnValue(mockExcelRows);
      jest.spyOn(processingService, 'loadExistingData').mockResolvedValue({
        customerNumberMap: mockCustomerNumberMap,
        nextCodeNumber: 2,
      });
      jest.spyOn(validationService, 'validateRows').mockReturnValue(mockValidationResult);

      const result = await service.validateExcel(mockBuffer);

      expect(validationService.parseExcelFile).toHaveBeenCalledWith(mockBuffer);
      expect(processingService.loadExistingData).toHaveBeenCalled();
      expect(validationService.validateRows).toHaveBeenCalledWith(mockExcelRows, mockCustomerNumberMap);
      expect(result).toHaveProperty('sessionId');
      expect(result.message).toBe(mockValidationResult.message);
      expect(result.result).toEqual(mockValidationResult.result);
    });

    it('should create session with validation data', async () => {
      const mockBuffer = Buffer.from('mock excel data');
      const mockCustomerNumberMap = new Map<string, CustomerInfo>();

      jest.spyOn(validationService, 'parseExcelFile').mockReturnValue(mockExcelRows);
      jest.spyOn(processingService, 'loadExistingData').mockResolvedValue({
        customerNumberMap: mockCustomerNumberMap,
        nextCodeNumber: 2,
      });
      jest.spyOn(validationService, 'validateRows').mockReturnValue(mockValidationResult);

      const result = await service.validateExcel(mockBuffer);

      expect(result.sessionId).toMatch(/^validation_\d+_[a-z0-9]{9}$/);
    });
  });

  describe('processValidatedData', () => {
    it('should process validated data successfully', async () => {
      const sessionId = 'validation_1234567890_abc123def';
      const mockCustomerNumberMap = new Map<string, CustomerInfo>();
      const mockNextCodeNumber = 2;

      // Mock session data
      const mockSession = {
        id: sessionId,
        data: {
          rows: mockExcelRows,
          customerNumberMap: mockCustomerNumberMap,
          nextCodeNumber: mockNextCodeNumber,
        },
        validationResult: mockValidationResult,
        createdAt: new Date(),
      };

      // Mock private method using reflection
      const getSessionSpy = jest.spyOn(service as any, 'getSession').mockReturnValue(mockSession);
      const deleteSessionSpy = jest.spyOn(service as any, 'deleteSession').mockImplementation();

      jest.spyOn(processingService, 'processRows').mockResolvedValue({
        toCreate: [mockCustomerInfo],
        toUpdate: [],
        errors: [],
        successCount: 1,
        failCount: 0,
      });
      jest.spyOn(processingService, 'saveData').mockResolvedValue();
      jest.spyOn(processingService, 'createResponse').mockReturnValue(mockProcessingResult);

      const result = await service.processValidatedData(sessionId, 'add');

      expect(getSessionSpy).toHaveBeenCalledWith(sessionId);
      expect(processingService.processRows).toHaveBeenCalledWith(
        mockExcelRows,
        mockCustomerNumberMap,
        mockNextCodeNumber,
        'add',
        'system'
      );
      expect(processingService.saveData).toHaveBeenCalled();
      expect(deleteSessionSpy).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(mockProcessingResult);
    });

    it('should throw error for invalid session', async () => {
      const invalidSessionId = 'invalid_session_id';

      jest.spyOn(service as any, 'getSession').mockReturnValue(undefined);

      await expect(service.processValidatedData(invalidSessionId, 'add')).rejects.toThrow(
        BadRequestException
      );
      await expect(service.processValidatedData(invalidSessionId, 'add')).rejects.toThrow(
        '유효하지 않은 세션입니다.'
      );
    });

    it('should process with overwrite mode', async () => {
      const sessionId = 'validation_1234567890_abc123def';
      const mockCustomerNumberMap = new Map<string, CustomerInfo>();
      const mockNextCodeNumber = 2;

      const mockSession = {
        id: sessionId,
        data: {
          rows: mockExcelRows,
          customerNumberMap: mockCustomerNumberMap,
          nextCodeNumber: mockNextCodeNumber,
        },
        validationResult: mockValidationResult,
        createdAt: new Date(),
      };

      jest.spyOn(service as any, 'getSession').mockReturnValue(mockSession);
      jest.spyOn(service as any, 'deleteSession').mockImplementation();
      jest.spyOn(processingService, 'processRows').mockResolvedValue({
        toCreate: [],
        toUpdate: [mockCustomerInfo],
        errors: [],
        successCount: 1,
        failCount: 0,
      });
      jest.spyOn(processingService, 'saveData').mockResolvedValue();
      jest.spyOn(processingService, 'createResponse').mockReturnValue(mockProcessingResult);

      const result = await service.processValidatedData(sessionId, 'overwrite');

      expect(processingService.processRows).toHaveBeenCalledWith(
        mockExcelRows,
        mockCustomerNumberMap,
        mockNextCodeNumber,
        'overwrite',
        'system'
      );
      expect(result).toEqual(mockProcessingResult);
    });
  });

  describe('session management', () => {
    it('should create session with correct data', () => {
      const mockCustomerNumberMap = new Map<string, CustomerInfo>();
      mockCustomerNumberMap.set('1234567890', mockCustomerInfo);

      const createSessionSpy = jest.spyOn(service as any, 'createSession').mockReturnValue('test_session_id');

      const sessionId = service['createSession'](mockExcelRows, mockCustomerNumberMap, mockValidationResult);

      expect(createSessionSpy).toHaveBeenCalledWith(mockExcelRows, mockCustomerNumberMap, mockValidationResult);
      expect(sessionId).toBe('test_session_id');
    });

    it('should get session by id', () => {
      const sessionId = 'test_session_id';
      const mockSession = {
        id: sessionId,
        data: { rows: mockExcelRows, customerNumberMap: new Map(), nextCodeNumber: 1 },
        validationResult: mockValidationResult,
        createdAt: new Date(),
      };

      jest.spyOn(service as any, 'getSession').mockReturnValue(mockSession);

      const result = service['getSession'](sessionId);

      expect(result).toEqual(mockSession);
    });

    it('should delete session by id', () => {
      const sessionId = 'test_session_id';
      const deleteSessionSpy = jest.spyOn(service as any, 'deleteSession').mockImplementation();

      service['deleteSession'](sessionId);

      expect(deleteSessionSpy).toHaveBeenCalledWith(sessionId);
    });

    it('should cleanup old sessions', () => {
      const cleanupSpy = jest.spyOn(service as any, 'cleanupOldSessions').mockImplementation();

      service.cleanupOldSessions(24);

      expect(cleanupSpy).toHaveBeenCalledWith(24);
    });
  });

  describe('error handling', () => {
    it('should handle validation service errors', async () => {
      const mockBuffer = Buffer.from('mock excel data');

      jest.spyOn(validationService, 'parseExcelFile').mockImplementation(() => {
        throw new Error('Excel parsing failed');
      });

      await expect(service.validateExcel(mockBuffer)).rejects.toThrow('Excel parsing failed');
    });

    it('should handle processing service errors', async () => {
      const mockBuffer = Buffer.from('mock excel data');

      jest.spyOn(validationService, 'parseExcelFile').mockReturnValue(mockExcelRows);
      jest.spyOn(processingService, 'loadExistingData').mockRejectedValue(new Error('Database error'));

      await expect(service.processExcel(mockBuffer)).rejects.toThrow('Database error');
    });

    it('should handle save data errors', async () => {
      const mockBuffer = Buffer.from('mock excel data');
      const mockCustomerNumberMap = new Map<string, CustomerInfo>();

      jest.spyOn(validationService, 'parseExcelFile').mockReturnValue(mockExcelRows);
      jest.spyOn(processingService, 'loadExistingData').mockResolvedValue({
        customerNumberMap: mockCustomerNumberMap,
        nextCodeNumber: 2,
      });
      jest.spyOn(processingService, 'processRows').mockResolvedValue({
        toCreate: [mockCustomerInfo],
        toUpdate: [],
        errors: [],
        successCount: 1,
        failCount: 0,
      });
      jest.spyOn(processingService, 'saveData').mockRejectedValue(new Error('Save failed'));

      await expect(service.processExcel(mockBuffer)).rejects.toThrow('Save failed');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete upload flow', async () => {
      const mockBuffer = Buffer.from('mock excel data');
      const mockCustomerNumberMap = new Map<string, CustomerInfo>();

      // Step 1: Validate
      jest.spyOn(validationService, 'parseExcelFile').mockReturnValue(mockExcelRows);
      jest.spyOn(processingService, 'loadExistingData').mockResolvedValue({
        customerNumberMap: mockCustomerNumberMap,
        nextCodeNumber: 2,
      });
      jest.spyOn(validationService, 'validateRows').mockReturnValue(mockValidationResult);

      const validationResult = await service.validateExcel(mockBuffer);

      expect(validationResult).toHaveProperty('sessionId');
      expect(validationResult.result.totalCount).toBe(1);

      // Step 2: Process validated data
      const sessionId = validationResult.sessionId!;
      const mockSession = {
        id: sessionId,
        data: {
          rows: mockExcelRows,
          customerNumberMap: mockCustomerNumberMap,
          nextCodeNumber: 2,
        },
        validationResult: mockValidationResult,
        createdAt: new Date(),
      };

      jest.spyOn(service as any, 'getSession').mockReturnValue(mockSession);
      jest.spyOn(service as any, 'deleteSession').mockImplementation();
      jest.spyOn(processingService, 'processRows').mockResolvedValue({
        toCreate: [mockCustomerInfo],
        toUpdate: [],
        errors: [],
        successCount: 1,
        failCount: 0,
      });
      jest.spyOn(processingService, 'saveData').mockResolvedValue();
      jest.spyOn(processingService, 'createResponse').mockReturnValue(mockProcessingResult);

      const processResult = await service.processValidatedData(sessionId, 'add');

      expect(processResult.result.successCount).toBe(1);
      expect(processResult.result.summary.created).toBe(1);
    });
  });
}); 