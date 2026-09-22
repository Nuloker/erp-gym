import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * CreateClassGroupDto
 * DTO para criação de uma nova turma.
 * A turma é vinculada a uma modalidade e opcionalmente a um professor.
 */
export class CreateClassGroupDto {
  // ID da modalidade da turma — obrigatório
  @ApiProperty({ example: 'uuid-da-modalidade' })
  @IsUUID()
  modalityId: string;

  // ID do professor responsável — opcional
  @ApiPropertyOptional({ example: 'uuid-do-professor' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  // Nome da turma ex: "Funcional Manhã"
  @ApiProperty({ example: 'Funcional Manhã' })
  @IsString()
  @MaxLength(100)
  name: string;

  // Capacidade máxima de alunos — 0 = ilimitado
  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCapacity?: number;

  // Se a turma está ativa — padrão true
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Observações sobre a turma
  @ApiPropertyOptional({ example: 'Turma para alunos iniciantes' })
  @IsOptional()
  @IsString()
  observations?: string;
}
