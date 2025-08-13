import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base.entity';
@Entity()
export class BusinessBank extends BaseEntity {
  @ApiProperty({ example: 'BUS001', description: '사업장 코드' })
  @Column({ name: 'business_code', length: 20, comment: '사업장 코드' })
  businessCode: string;

  @ApiProperty({ example: '001', description: '은행 코드' })
  @Column({ name: 'bank_code', length: 10, comment: '은행 코드' })
  bankCode: string;

  @ApiProperty({ example: '국민은행', description: '은행명' })
  @Column({ name: 'bank_name', length: 50, comment: '은행명' })
  bankName: string;

  @ApiProperty({ example: '1234567890', description: '계좌 번호' })
  @Column({ name: 'account_number', length: 20, comment: '계좌 번호' })
  accountNumber: string;

  @ApiProperty({ example: '홍길동', description: '예금주' })
  @Column({ name: 'account_holder', length: 50, comment: '예금주' })
  accountHolder: string;
}
