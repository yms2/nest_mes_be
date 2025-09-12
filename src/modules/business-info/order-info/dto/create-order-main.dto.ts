import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, MaxLength } from "class-validator";

export class CreateOrderMainDto {
    @ApiProperty({ example: 'ORD001', description: '수주 코드 (자동 생성)' })
    @IsNotEmpty({ message: '수주 코드는 필수입니다.' })
    @IsString({ message: '수주 코드는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '수주 코드는 20자를 초과할 수 없습니다.' })
    orderCode: string;

    @ApiProperty({ example: '발주비고', description: '발주비고' })
    @IsOptional()
    @IsString({ message: '발주비고는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '발주비고는 20자를 초과할 수 없습니다.' })
    remark?: string;

    @ApiProperty({ example: '승인정보', description: '승인정보' })
    @IsOptional()
    @IsString({ message: '승인정보는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '승인정보는 20자를 초과할 수 없습니다.' })
    approvalInfo?: string;
}
