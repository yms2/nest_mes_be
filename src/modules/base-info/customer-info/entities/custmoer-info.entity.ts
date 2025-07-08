import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class CustomerInfo {
  @ApiProperty({ example: 1, description: '고객 고유 ID (자동 생성)' })
  @PrimaryGeneratedColumn({ comment: '고객 고유 ID (자동 생성)' })
  id: number;

  @ApiProperty({ example: 'CUS001', description: '고객 코드 (자동 생성)'})
  @Column({ name:'customer_code', type: 'varchar', length: 20, unique: true, comment: '고객 코드 (자동 생성)' })
  customerCode: string;

  @ApiProperty({ example: '현대자동차' , description: '거래처 명'})
  @Column({name:'customer_name', type: 'varchar', length: 100, comment: '거래처 명' })
  customerName: string;

  @ApiProperty({ example: '333-33-33333', description: '사업자 번호'})
  @Column({name:'customer_number', type: 'varchar', length: 20, unique: true, comment: '사업자 번호' })
  customerNumber: string;

  @ApiProperty({ example: '정영기', description: '거래처CEO'})
  @Column({name:'customer_ceo', type: 'varchar', length: 50, comment: '거래처 CEO'})
  customerCeo: string;

  @ApiProperty({ example: '기계업', description: '업태'})
  @Column({name:'customer_business_type', type: 'varchar', length: 50, nullable: true, comment: '업태'})
  customerBusinessType: string;

  @ApiProperty({ example: '기계제조업', description: '종목'})
  @Column({name:'customer_business_item', type: 'varchar', length: 50, nullable: true, comment: '종목'})
  customerBusinessItem: string;

  @ApiProperty({ example: '051-3322-3321' , description: '거래처 전화번호'})
  @Column({name:'customer_tel', type: 'varchar', length: 20, nullable: true, comment: '거래처 전화번호'})
  customerTel: string;

  @ApiProperty({ example: '010-1234-5678', description: '거래처 휴대폰번호'})
  @Column({name:'customer_mobile', type: 'varchar', length: 20, nullable: true, comment: '거래처 휴대폰번호'})
  customerMobile: string;

  @ApiProperty({ example: 'test@naver.com', description: '거래처 이메일'})
  @Column({name:'customer_email', type: 'varchar', length: 100, nullable: true, comment: '거래처 이메일'})
  customerEmail: string;

  @ApiProperty({ example: '42520', description: '거래처 우편번호'})
  @Column({name:'customer_zipcode', type: 'varchar', length: 20, nullable: true, comment: '거래처 우편번호'})
  customerZipcode: string;

  @ApiProperty({ example: '부산광역시 해운대구 센텀동로 123', description: '거래처 주소'})
  @Column({name:'customer_address', type: 'varchar', length: 200, nullable: true, comment: '거래처 주소'})
  customerAddress: string;

  @ApiProperty({ example: '아파트 3층', description: '거래처 상세주소'})
  @Column({name:'customer_address_detail', type: 'varchar', length: 200, nullable: true, comment: '거래처 상세주소'})
  customerAddressDetail: string;

  @ApiProperty({ example: 'admin'  , description: '계정 생성자' })
  @Column({ name: 'created_by', type: 'varchar', length: 50, comment: '계정 생성자' })
  createdBy: string;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 생성일시 (자동 생성)' })
  @CreateDateColumn({ comment: '생성일시' })
  createdAt: Date;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 수정일시 (자동 생성)' })
  @UpdateDateColumn({ comment: '수정일시' })
  updatedAt: Date;
}