import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { BusinessInfoModule } from './business-info.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

describe('BusinessInfo (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
        BusinessInfoModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/business-info (GET)', () => {
    it('should return business info list', () => {
      return request(app.getHttpServer())
        .get('/business-info')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return paginated results', () => {
      return request(app.getHttpServer())
        .get('/business-info?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(5);
        });
    });
  });

  describe('/business-info (POST)', () => {
    const createBusinessDto = {
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

    it('should create business info successfully', () => {
      return request(app.getHttpServer())
        .post('/business-info')
        .send(createBusinessDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.businessNumber).toBe('1234567890');
          expect(res.body.data.businessName).toBe('테스트 사업장');
          expect(res.body.data.businessCeo).toBe('홍길동');
        });
    });

    it('should return 400 for duplicate business number', () => {
      return request(app.getHttpServer())
        .post('/business-info')
        .send(createBusinessDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('이미 사용중인 사업자 번호입니다');
        });
    });

    it('should return 400 for invalid business number format', () => {
      const invalidDto = {
        ...createBusinessDto,
        businessNumber: '123456789', // Invalid format
      };

      return request(app.getHttpServer())
        .post('/business-info')
        .send(invalidDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('사업자 번호는 10자리 숫자여야 합니다');
        });
    });

    it('should return 400 for missing required fields', () => {
      const incompleteDto = {
        businessNumber: '1234567890',
        // Missing businessName and businessCeo
      };

      return request(app.getHttpServer())
        .post('/business-info')
        .send(incompleteDto)
        .expect(400);
    });
  });

  describe('/business-info/:id (GET)', () => {
    it('should return business info by id', () => {
      return request(app.getHttpServer())
        .get('/business-info/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('businessNumber');
          expect(res.body).toHaveProperty('businessName');
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get('/business-info/999')
        .expect(404);
    });
  });

  describe('/business-info/:id (PUT)', () => {
    const updateDto = {
      businessName: '업데이트된 사업장',
      businessCeo: '김철수',
      businessType: '서비스업',
    };

    it('should update business info successfully', () => {
      return request(app.getHttpServer())
        .put('/business-info/1')
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.businessName).toBe('업데이트된 사업장');
          expect(res.body.data.businessCeo).toBe('김철수');
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .put('/business-info/999')
        .send(updateDto)
        .expect(404);
    });
  });

  describe('/business-info/:id (DELETE)', () => {
    it('should delete business info successfully', () => {
      return request(app.getHttpServer())
        .delete('/business-info/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('삭제되었습니다');
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .delete('/business-info/999')
        .expect(404);
    });
  });

  describe('/business-info/download-template (GET)', () => {
    it('should return excel template file', () => {
      return request(app.getHttpServer())
        .get('/business-info/download-template')
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          expect(res.headers['content-disposition']).toContain('attachment');
          expect(res.headers['content-disposition']).toContain('사업장정보 양식.xlsx');
        });
    });
  });

  describe('/business-info/download-excel (GET)', () => {
    it('should return excel file with business data', () => {
      return request(app.getHttpServer())
        .get('/business-info/download-excel')
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          expect(res.headers['content-disposition']).toContain('attachment');
        });
    });
  });

  describe('/business-info/download-search-excel (GET)', () => {
    it('should return excel file with search results', () => {
      return request(app.getHttpServer())
        .get('/business-info/download-search-excel?keyword=테스트')
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          expect(res.headers['content-disposition']).toContain('attachment');
        });
    });
  });
}); 