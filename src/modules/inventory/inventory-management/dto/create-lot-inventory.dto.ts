import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLotInventoryDto {
    @ApiProperty({
        example: 'PRD001',
        description: '품목 코드',
        required: true,
    })
    @IsString({ message: '품목 코드는 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '품목 코드는 필수입니다.' })
    productCode: string;

    @ApiProperty({
        example: 'LOT001',
        description: 'LOT 코드',
        required: true,
    })
    @IsString({ message: 'LOT 코드는 문자열이어야 합니다.' })
    @IsNotEmpty({ message: 'LOT 코드는 필수입니다.' })
    lotCode: string;

    @ApiProperty({
        example: 100,
        description: '수량',
        required: true,
    })
    @IsNumber({}, { message: '수량은 숫자여야 합니다.' })
    @IsNotEmpty({ message: '수량은 필수입니다.' })
    quantity: number;

    @ApiProperty({
        example: '제품명',
        description: '품목명',
        required: true,
    })
    @IsString({ message: '품목명은 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '품목명은 필수입니다.' })
    productName: string;

    @ApiProperty({
        example: 'EA',
        description: '단위',
        required: true,
    })
    @IsString({ message: '단위는 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '단위는 필수입니다.' })
    unit: string;

    @ApiProperty({
        example: '창고A',
        description: '보관 위치',
        required: true,
    })
    @IsString({ message: '보관 위치는 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '보관 위치는 필수입니다.' })
    storageLocation: string;

    @ApiProperty({
        example: 'RCV001',
        description: '입고 코드',
        required: true,
    })
    @IsString({ message: '입고 코드는 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '입고 코드는 필수입니다.' })
    receivingCode: string;

    @ApiProperty({
        example: 'system',
        description: '사용자명',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '사용자명은 문자열이어야 합니다.' })
    username?: string;
}

export class DecreaseLotInventoryDto {
    @ApiProperty({
        example: 'PRD001',
        description: '품목 코드',
        required: true,
    })
    @IsString({ message: '품목 코드는 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '품목 코드는 필수입니다.' })
    productCode: string;

    @ApiProperty({
        example: 'LOT001',
        description: 'LOT 코드',
        required: true,
    })
    @IsString({ message: 'LOT 코드는 문자열이어야 합니다.' })
    @IsNotEmpty({ message: 'LOT 코드는 필수입니다.' })
    lotCode: string;

    @ApiProperty({
        example: 50,
        description: '감소할 수량',
        required: true,
    })
    @IsNumber({}, { message: '수량은 숫자여야 합니다.' })
    @IsNotEmpty({ message: '수량은 필수입니다.' })
    quantity: number;

    @ApiProperty({
        example: 'system',
        description: '사용자명',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '사용자명은 문자열이어야 합니다.' })
    username?: string;
}
