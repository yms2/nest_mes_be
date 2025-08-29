import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class DeleteBomProcessDto {
  @ApiProperty({
    description: '삭제 사유',
    example: '공정 변경으로 인한 제거',
    required: false,
  })
  @IsString()
  @IsOptional()
  deleteReason?: string;

  @ApiProperty({
    description: '삭제 담당자',
    example: '김철수',
    required: false,
  })
  @IsString()
  @IsOptional()
  deleteWorker?: string;
}
