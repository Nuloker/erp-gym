import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * UpdateClassGroupDto
 * DTO para atualização parcial de uma turma.
 * Todos os campos são opcionais — apenas os informados são atualizados.
 */
export class UpdateClassGroupDto {
  // Nova modalidade da turma
  @ApiPropertyOptional({ example: 'uuid-da-modalidade' })
  @IsOptional()
  @IsUUID()
  modalityId?: string;

  // Novo professor responsável
  @ApiPropertyOptional({ example: 'uuid-do-professor' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  // Novo nome da turma
  @ApiPropertyOptional({ example: 'Funcional Tarde' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  // Nova capacidade máxima
  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCapacity?: number;

  // Novo status ativo/inativo
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Novas observações
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;
}
