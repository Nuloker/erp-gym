import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkoutPlanDto {
  @ApiProperty({ example: 'uuid-do-aluno' })
  @IsUUID()
  studentId: string;

  @ApiPropertyOptional({ example: 'uuid-do-professor' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiProperty({ example: 'Treino A - Peito e Tríceps' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Foco em hipertrofia de membros superiores' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  division?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'Executar em dias alternados' })
  @IsOptional()
  @IsString()
  observations?: string;
}
