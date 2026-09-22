import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsUUID,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '../entities/invoice.entity';

/**
 * CreateInvoiceDto
 * DTO para criação de uma nova cobrança.
 * Usado tanto para geração manual quanto automática de mensalidades.
 */
export class CreateInvoiceDto {
  // ID do aluno que receberá a cobrança — obrigatório
  @ApiProperty({ example: 'uuid-do-aluno' })
  @IsUUID()
  studentId: string;

  // ID da matrícula relacionada — opcional
  @ApiPropertyOptional({ example: 'uuid-da-matricula' })
  @IsOptional()
  @IsUUID()
  enrollmentId?: string;

  // Descrição da cobrança ex: "Mensalidade Maio/2026"
  @ApiProperty({ example: 'Mensalidade Maio/2026' })
  @IsString()
  @MaxLength(200)
  description: string;

  // Valor original da cobrança — obrigatório, mínimo 0
  @ApiProperty({ example: 99.9 })
  @IsNumber()
  @Min(0)
  amount: number;

  // Desconto a aplicar na cobrança — padrão 0
  @ApiPropertyOptional({ example: 10.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  // Data de vencimento da cobrança — formato ISO (YYYY-MM-DD)
  @ApiProperty({ example: '2026-05-10' })
  @IsDateString()
  dueDate: string;

  // Status inicial da cobrança — padrão pending
  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  // Observações internas sobre a cobrança
  @ApiPropertyOptional({ example: 'Cobrança gerada automaticamente' })
  @IsOptional()
  @IsString()
  observations?: string;
}
