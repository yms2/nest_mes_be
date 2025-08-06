import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsOptional, Matches } from 'class-validator';

export class CreateProcessInfoDto {
    @ApiProperty({
        example: '공정 코드',
        description: '공정 코드',
        required: true,
    })
    @IsString({ message: '공정 코드는 필수값입니다.' })
    @IsNotEmpty({ message: '공정 코드는 필수 입력값입니다.' })
    processCode: string;

    @ApiProperty({
        example: '공정 명',
        description: '공정 명',
        required: true,
    })
    @IsString({ message: '공정 명은 필수값입니다.' })
    @IsNotEmpty({ message: '공정 명은 필수 입력값입니다.' })
    processName: string;

    @ApiProperty({
        example: '공정 설명',
        description: '공정 설명',
        required: true,
    })
    processDescription: string;
}