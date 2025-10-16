import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class WarehouseZoneCreateDto {
    @ApiProperty({ example: 'ZONE001', description: '구역 코드' })
    @IsString()
    @IsNotEmpty()
    zoneCode: string;

    @ApiProperty({ example: '1구역', description: '구역 이름' })
    @IsString()
    @IsNotEmpty()
    zoneName: string;

    @ApiProperty({ example: '창고 내부 북쪽 구역', description: '구역 설명', required: false })
    @IsString()
    @IsOptional()
    zoneDescription?: string;

    @ApiProperty({ example: 'ACTIVE', description: '구역 상태', required: false })
    @IsString()
    @IsOptional()
    zoneStatus?: string;

    @ApiProperty({ example: 1, description: '창고 ID' })
    @IsNumber()
    @IsNotEmpty()
    warehouseId: number;

    @ApiProperty({ example: '구역 비고', description: '구역 비고', required: false })
    @IsString()
    @IsOptional()
    zoneBigo?: string;
}
