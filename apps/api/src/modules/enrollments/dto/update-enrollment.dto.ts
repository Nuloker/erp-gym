import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus } from '../entities/enrollment.entity';

/**
 * UpdateEnrollmentDto
 * DTO para atualização parcial de uma matrícula.
 * Permite alterar status, observações e bloqueio.
 */
export class UpdateEnrollmentDto {
  // Novo status da matrícula
  @ApiPropertyOptional({ enum: EnrollmentStatus })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  // Motivo do cancelamento — obrigatório ao cancelar
  @ApiPropertyOptional({ example: 'Aluno solicitou cancelamento' })
  @IsOptional()
  @IsString()
  cancellationReason?: string;

  // Observações gerais
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;

  // Bloquear ou desbloquear acesso do aluno
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;
}
