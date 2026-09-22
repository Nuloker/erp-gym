import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus } from '../entities/enrollment.entity';

/**
 * CreateEnrollmentDto
 * DTO de entrada para criação de uma nova matrícula.
 * Valida os dados recebidos antes de chegar no service.
 */
export class CreateEnrollmentDto {
  // ID do aluno que será matriculado — obrigatório
  @ApiProperty({ example: 'uuid-do-aluno' })
  @IsUUID()
  studentId: string;

  // ID do plano contratado — obrigatório
  @ApiProperty({ example: 'uuid-do-plano' })
  @IsUUID()
  planId: string;

  // Data de início da matrícula — formato ISO 8601 (YYYY-MM-DD)
  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  startDate: string;

  // Status inicial da matrícula — padrão active
  @ApiPropertyOptional({ enum: EnrollmentStatus })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  // Observações opcionais sobre a matrícula
  @ApiPropertyOptional({ example: 'Aluno indicado por membro' })
  @IsOptional()
  @IsString()
  observations?: string;
}
