import { ApiProperty } from '@nestjs/swagger';
import { 
    IsString, 
    IsNotEmpty, 
    IsDateString, 
    IsEmail, 
} from 'class-validator';
import { OptionalString } from 'src/common/decorators/optional-string.decorator';

export class CreateEmployeeDto {

    //필수값
    @ApiProperty({
        example: '홍길동',
        description: '직원 이름 (필수)',
        required: true,
    })
    @IsString({ message: '직원 이름은 필수값입니다.' })
    @IsNotEmpty({ message: '직원 이름은 필수 입력값입니다.' })
    employeeName: string;

    @ApiProperty({
        example: '부서',
        description: '부서명 (필수)',
        required: true,
    })
    @IsString({ message: '부서명은 필수값입니다.' })
    @IsNotEmpty({ message: '부서명은 필수 입력값입니다.' })
    department: string;

    @ApiProperty({
        example: '직급',
        description: '직급 (필수)',
        required: true,
    })
    @IsString({ message: '직급은 필수값입니다.' })
    @IsNotEmpty({ message: '직급은 필수 입력값입니다.' })
    position: string;

    @ApiProperty({
        example: '남',
        description: '성별 (필수)',
        required: true,
    })
    @IsString({ message: '성별은 필수값입니다.' })
    @IsNotEmpty({ message: '성별은 필수 입력값입니다.' })
    gender: string;

    @ApiProperty({
        example: '내외국인',
        description: '내외국인 (필수)',
        required: true,
    })
    @IsString({ message: '내외국인은 필수값입니다.' })
    @IsNotEmpty({ message: '내외국인은 필수 입력값입니다.' })
    domesticForeign: string;

    @ApiProperty({
        example: '2025-01-01',
        description: '생년월일 (필수)',
        required: true,
    })
    @IsDateString({}, { message: '생년월일은 날짜 형식이어야 합니다.' })
    @IsNotEmpty({ message: '생년월일은 필수 입력값입니다.' })
    birthday: Date;

    @ApiProperty({
        example: '010-1234-5678',
        description: '직원 전화번호 (필수)',
        required: true,
    })
    @IsString({ message: '직원 전화번호는 필수값입니다.' })
    @IsNotEmpty({ message: '직원 전화번호는 필수 입력값입니다.' })
    employeePhone: string;

    @ApiProperty({
        example: 'test@naver.com',
        description: '직원 이메일 (필수)',
        required: true,
    })
    @IsEmail({}, { message: '이메일 형식이 잘못되었습니다.' })
    @IsNotEmpty({ message: '직원 이메일은 필수 입력값입니다.' })
    employeeEmail: string;

    @ApiProperty({
        example: '2025-01-01',
        description: '입사일 (필수)',
        required: true,
    })
    @IsDateString({}, { message: '입사일은 날짜 형식이어야 합니다.' })
    @IsNotEmpty({ message: '입사일은 필수 입력값입니다.' })
    hireDate: Date;

    @ApiProperty({
        example: '2025-01-01',
        description: '퇴사일 (선택)',
        required: false,
    })
    @IsDateString({}, { message: '퇴사일은 날짜 형식이어야 합니다.' })
    resignationDate?: Date;

    @ApiProperty({
        example: '12345',
        description: '우편번호 (필수)',
        required: true,
    })
    @IsString({ message: '우편번호는 필수값입니다.' })
    @IsNotEmpty({ message: '우편번호는 필수 입력값입니다.' })
    zipcode: string;

    @ApiProperty({
        example: '서울시 강남구 역삼동',
        description: '주소 (필수)',
        required: true,
    })
    @IsString({ message: '주소는 필수값입니다.' })
    @IsNotEmpty({ message: '주소는 필수 입력값입니다.' })
    address: string;

    @ApiProperty({
        example: '아파트 3층',
        description: '상세주소 (선택)',
        required: false,
    })
    @OptionalString()
    addressDetail?: string;

}