import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PermissionDeleteDto {
    @ApiProperty({ example: 1, description: '삭제할 권한 ID' })
    @IsNumber({}, { message: '권한 ID는 숫자여야 합니다.' })
    @IsNotEmpty({ message: '권한 ID는 필수값입니다.' })
    id: number;

    @ApiProperty({ example: '권한 그룹 삭제 사유', description: '삭제 사유 (선택)', required: false })
    @IsOptional()
    @IsString({ message: '삭제 사유는 문자열이어야 합니다.' })
    deleteReason?: string;
}

export class BatchPermissionDeleteDto {
    @ApiProperty({ example: [1, 2, 3], description: '삭제할 권한 ID 배열' })
    @IsNumber({}, { each: true, message: '모든 권한 ID는 숫자여야 합니다.' })
    @IsNotEmpty({ message: '권한 ID 배열은 필수값입니다.' })
    ids: number[];

    @ApiProperty({ example: '권한 그룹 일괄 삭제', description: '삭제 사유 (선택)', required: false })
    @IsOptional()
    @IsString({ message: '삭제 사유는 문자열이어야 합니다.' })
    deleteReason?: string;
}
