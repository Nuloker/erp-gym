import { IsUUID, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * CreateAttendanceDto
 * DTO para registrar um check-in de aluno.
 * O checkedInAt é opcional — se não informado,
 * o sistema usa a data/hora atual automaticamente.
 */
export class CreateAttendanceDto {
  // ID do aluno que está fazendo check-in — obrigatório
  @ApiProperty({ example: 'uuid-do-aluno' })
  @IsUUID()
  studentId: string;

  // Data e hora do check-in — se não informado usa o momento atual
  @ApiPropertyOptional({ example: '2026-04-29T10:00:00' })
  @IsOptional()
  @IsDateString()
  checkedInAt?: string;

  // Observações opcionais sobre o check-in
  @ApiPropertyOptional({ example: 'Check-in manual pela recepção' })
  @IsOptional()
  @IsString()
  observations?: string;
}
