import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Employee extends BaseEntity {
    @ApiProperty({ example: 'EMP001', description: '직원 코드 (자동 생성)' })
    @Column({
        name: 'employee_code',
        type: 'varchar',
        length: 20,
        unique: true,
        comment: '직원 코드 (자동 생성)',
    })
    employeeCode: string;

    @ApiProperty({ example: '홍길동', description: '직원 이름' })
    @Column({ name: 'employee_name', type: 'varchar', length: 50, comment: '직원 이름' })
    employeeName: string;

    @ApiProperty({ example: '부서', description: '부서명' })
    @Column({ name: 'department', type: 'varchar', length: 50, comment: '부서명' })
    department: string;

    @ApiProperty({ example: '직급', description: '직급' })
    @Column({ name: 'position', type: 'varchar', length: 50, comment: '직급' })
    position: string;

    @ApiProperty({ example: '남', description: '성별' })
    @Column({ name: 'gender', type: 'varchar', length: 10, comment: '성별' })
    gender: string;

    @ApiProperty({ example: '내외국인', description: '내외국인' })
    @Column({ name: 'domestic_foreign', type: 'varchar', length: 10, comment: '내외국인' })
    domesticForeign: string;

    @ApiProperty({ example: '생년월일', description: '생년월일' })
    @Column({ name: 'birthday', type: 'date', comment: '생년월일' })
    birthday: Date;

    @ApiProperty({ example: '010-1234-5678', description: '직원 전화번호' })
    @Column({ name: 'employee_phone', type: 'varchar', length: 20, comment: '직원 전화번호' })
    employeePhone: string;

    @ApiProperty({ example: 'test@naver.com', description: '직원 이메일' })
    @Column({ name: 'employee_email', type: 'varchar', length: 100, comment: '직원 이메일' })
    employeeEmail: string;

    @ApiProperty({ example: '2025-01-01', description: '입사일' })
    @Column({ name: 'hire_date', type: 'date', comment: '입사일' })
    hireDate: Date;

    @ApiProperty({ example: '2025-01-01', description: '퇴사일' })
    @Column({ name: 'resignation_date', type: 'date', comment: '퇴사일' })
    resignationDate: Date;

    @ApiProperty({ example: '12345', description: '우편번호' })
    @Column({ name: 'zipcode', type: 'varchar', length: 20, comment: '우편번호' })
    zipcode: string;

    @ApiProperty({ example: '서울시 강남구 역삼동', description: '주소' })
    @Column({ name: 'address', type: 'varchar', length: 100, comment: '주소' })
    address: string;

    @ApiProperty({ example: '서울시 강남구 역삼동', description: '상세주소' })
    @Column({ name: 'address_detail', type: 'varchar', length: 100, comment: '상세주소' })
    addressDetail: string;
}