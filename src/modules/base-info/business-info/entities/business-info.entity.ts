import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class BusinessInfo {
  @ApiProperty({ example: 1, description: '사용자 고유 ID (자동 생성)' })
  @PrimaryGeneratedColumn({ comment: '사용자 고유 ID (자동 생성)' })
  id: number;

  @ApiProperty({ example: 'BPLC001', description: '사업장 코드' })
  @Column({ name: 'business_code', length: 20, unique: true, comment: '사업장 코드' })
  businessCode: string;

  @ApiProperty({ example: '6743001715', description: '사업자 번호' })
  @Column({ name: 'business_number', length: 12, unique: true, comment: '사업자 번호' })
  businessNumber: string;

  @ApiProperty({ example: '현대자동차', description: '사업장명' })
  @Column({ name: 'business_name', length: 100, comment: '사업장명' })
  businessName: string;

  @ApiProperty({ example: '김대호', description: '사업장 담당자' })
  @Column({ name: 'business_ceo', length: 50, comment: '사업장 담당자' })
  businessCeo: string;

  @ApiProperty({ example: '1234567890123', description: '법인번호' })
  @Column({
    name: 'corporate_registration_number',
    length: 13,
    nullable: true,
    comment: '법인번호',
  })
  corporateRegistrationNumber: string;

  @ApiProperty({ example: '제조업', description: '업태' })
  @Column({ name: 'business_type', length: 50, nullable: true, comment: '업태' })
  businessType: string;

  @ApiProperty({ example: '금속 가공업', description: '종목' })
  @Column({ name: 'business_item', length: 100, nullable: true, comment: '종목' })
  businessItem: string;

  @ApiProperty({ example: '0513324423', description: '전화번호' })
  @Column({ name: 'business_tel', length: 13, nullable: true, comment: '전화번호' })
  businessTel: string;

  @ApiProperty({ example: '01012345678', description: '휴대전화' })
  @Column({ name: 'business_mobile', length: 13, nullable: true, comment: '휴대전화' })
  businessMobile: string;

  @ApiProperty({ example: '0513324423', description: 'FAX' })
  @Column({ name: 'business_fax', length: 13, nullable: true, comment: 'FAX' })
  businessFax: string;

  @ApiProperty({ example: '23442', description: '우편번호' })
  @Column({ name: 'business_zipcode', length: 5, nullable: true, comment: '우편번호' })
  businessZipcode: string;

  @ApiProperty({ example: '서울특별시 강남구 역삼동 123-45', description: '주소' })
  @Column({ name: 'business_address', length: 100, nullable: true, comment: '주소' })
  businessAddress: string;

  @ApiProperty({ example: '서울특별시 강남구 역삼동 123-45', description: '상세주소' })
  @Column({ name: 'business_address_detail', length: 100, nullable: true, comment: '상세주소' })
  businessAddressDetail: string;

  @ApiProperty({ example: 'test@test.com', description: '대표자 이메일' })
  @Column({ name: 'business_ceo_email', length: 100, nullable: true, comment: '대표자 이메일' })
  businessCeoEmail: string;

  @ApiProperty({ example: 'admin'  , description: '계정 생성자' })
  @Column({nullable: true, name: 'created_by', type: 'varchar', length: 50, comment: '계정 생성자' })
  createdBy: string;

  @ApiProperty({ example: 'admin', description: '계정 수정자' })
  @Column({ nullable: true, name: 'updated_by', type: 'varchar', length: 50, comment: '계정 수정자' })
  updatedBy: string;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 생성일시 (자동 생성)' })
  @CreateDateColumn({ comment: '생성일시' })
  createdAt: Date;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 수정일시 (자동 생성)' })
  @UpdateDateColumn({ comment: '수정일시' })
  updatedAt: Date;

  @ApiProperty({ example: false, description: '삭제 여부' })
  @Column({ default: false, comment: '삭제 여부' })
  isDeleted: boolean;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '삭제일시' })
  @DeleteDateColumn({ nullable: true, comment: '삭제일시' })
  deletedAt: Date | null;
}
