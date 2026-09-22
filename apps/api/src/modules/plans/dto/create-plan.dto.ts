import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanDuration } from '../entities/plan.entity';

/**
 * CreatePlanDto
 * DTO de entrada para criação de um novo plano.
 * Valida e tipifica os dados recebidos na requisição HTTP.
 *
 * @IsString / @IsNumber / @IsEnum → validam o tipo do campo
 * @ApiProperty → documenta o campo no Swagger
 * @IsOptional → campo não é obrigatório na requisição
 * @Min → valor mínimo aceito para campos numéricos
 */
export class CreatePlanDto {
  // Nome do plano — obrigatório, máximo 100 caracteres
  @ApiProperty({ example: 'Plano Mensal' })
  @IsString()
  @MaxLength(100)
  name: string;

  // Descrição detalhada do plano — opcional
  @ApiPropertyOptional({ example: 'Acesso ilimitado por 30 dias' })
  @IsOptional()
  @IsString()
  description?: string;

  // Preço do plano — obrigatório, mínimo 0
  @ApiProperty({ example: 99.9 })
  @IsNumber()
  @Min(0)
  price: number;

  // Duração do plano usando o enum PlanDuration
  // Valores aceitos: monthly, quarterly, semiannual, annual, custom
  @ApiPropertyOptional({ enum: PlanDuration, default: PlanDuration.MONTHLY })
  @IsOptional()
  @IsEnum(PlanDuration)
  duration?: PlanDuration;

  // Número de dias do plano — útil para duração customizada
  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationDays?: number;

  // Taxa de matrícula cobrada ao contratar o plano — padrão 0
  @ApiPropertyOptional({ example: 50.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  enrollmentFee?: number;

  // Limite de acessos por mês — 0 significa ilimitado
  @ApiPropertyOptional({ example: 0, description: '0 = ilimitado' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accessLimit?: number;

  // Se o plano está ativo e disponível para venda — padrão true
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
