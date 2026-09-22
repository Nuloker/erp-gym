import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * CreateModalityDto
 * DTO para criação de uma nova modalidade.
 * Exemplos de modalidades: Musculação, Funcional, Spinning, Pilates.
 */
export class CreateModalityDto {
  // Nome da modalidade — obrigatório, máximo 100 caracteres
  @ApiProperty({ example: 'Funcional' })
  @IsString()
  @MaxLength(100)
  name: string;

  // Descrição opcional da modalidade
  @ApiPropertyOptional({ example: 'Treinamento funcional de alta intensidade' })
  @IsOptional()
  @IsString()
  description?: string;

  // Se a modalidade está ativa — padrão true
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
