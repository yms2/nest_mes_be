import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { OptionalString } from 'src/common/decorators/optional-string.decorator';

export class CreateWarehouseDto {

    @ApiProperty({
        example: '창고1',
        description: '창고 이름 (필수)',
        required: true,
    })
    @IsString({ message: '창고 이름은 필수값입니다.' })
    @IsNotEmpty({ message: '창고 이름은 필수 입력값입니다.' })
    warehouseName: string;
    
    @ApiProperty({
        example: '창고1',
        description: '창고 구역 (선택)',
        required: false,
    })
    @OptionalString()
    warehouseZone: string;

    @ApiProperty({
        example: '창고1',
        description: '창고 위치 (선택)',
        required: false,
    })
    @OptionalString()
    warehouseLocation: string;
    
    @ApiProperty({
        example: '창고1',
        description: '창고 비고 (선택)',
        required: false,
    })
    @OptionalString()
    warehouseBigo: string;
    
}