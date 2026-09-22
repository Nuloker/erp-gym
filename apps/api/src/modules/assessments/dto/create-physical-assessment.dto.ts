import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * CreatePhysicalAssessmentDto
 * DTO para criação de uma nova avaliação física.
 * Todos os campos de medidas são opcionais —
 * permite registrar avaliações parciais.
 */
export class CreatePhysicalAssessmentDto {
  // Aluno avaliado — obrigatório
  @ApiProperty({ example: 'uuid-do-aluno' })
  @IsUUID()
  studentId: string;

  // Avaliador — opcional
  @ApiPropertyOptional({ example: 'uuid-do-professor' })
  @IsOptional()
  @IsUUID()
  evaluatorId?: string;

  // Data da avaliação — obrigatório
  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  assessmentDate: string;

  // ── Medidas principais ───────────────────────────────────

  @ApiPropertyOptional({ example: 75.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({ example: 175.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  height?: number;

  @ApiPropertyOptional({ example: 24.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  bmi?: number;

  @ApiPropertyOptional({ example: 18.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  bodyFatPercentage?: number;

  @ApiPropertyOptional({ example: 61.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  leanMass?: number;

  @ApiPropertyOptional({ example: 14.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fatMass?: number;

  // ── Circunferências ──────────────────────────────────────

  @ApiPropertyOptional({ example: 38.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  neckCircumference?: number;

  @ApiPropertyOptional({ example: 95.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  chestCircumference?: number;

  @ApiPropertyOptional({ example: 80.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  waistCircumference?: number;

  @ApiPropertyOptional({ example: 95.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hipCircumference?: number;

  @ApiPropertyOptional({ example: 32.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  rightArmCircumference?: number;

  @ApiPropertyOptional({ example: 31.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  leftArmCircumference?: number;

  @ApiPropertyOptional({ example: 55.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  rightThighCircumference?: number;

  @ApiPropertyOptional({ example: 54.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  leftThighCircumference?: number;

  @ApiPropertyOptional({ example: 36.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  rightCalfCircumference?: number;

  @ApiPropertyOptional({ example: 35.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  leftCalfCircumference?: number;

  // ── Metas e observações ──────────────────────────────────

  @ApiPropertyOptional({ example: 70.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weightGoal?: number;

  @ApiPropertyOptional({ example: 'Aluno apresentou boa evolução' })
  @IsOptional()
  @IsString()
  observations?: string;
}
