import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class StartProductionDto {
  @ApiProperty({ 
    example: 'PI000001', 
    description: '생산 지시 코드',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  productionInstructionCode: string;
}
