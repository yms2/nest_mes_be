import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class PermissionCreateDto {
    @ApiProperty({ 
        example: 'all', 
        description: '모든 권한 (all, none, custom)',
        required: true 
    })
    @IsString()
    @IsNotEmpty()
    allGrant: string;

    @ApiProperty({ 
        example: 'admin', 
        description: '권한 그룹명',
        required: true 
    })
    @IsString()
    @IsNotEmpty()
    groupName: string;

    @ApiProperty({ 
        example: '[1, 2, 3]', 
        description: '메인 메뉴 ID 배열 (JSON 문자열)',
        required: false 
    })
    @IsString()
    @IsOptional()
    mainMenu?: string;

    @ApiProperty({ 
        example: '[4, 5, 6]', 
        description: '서브 메뉴 ID 배열 (JSON 문자열)',
        required: false 
    })
    @IsString()
    @IsOptional()
    subMenu?: string;
}
