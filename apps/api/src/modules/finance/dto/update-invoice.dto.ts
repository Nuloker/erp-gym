import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '../entities/invoice.entity';

/**
 * UpdateInvoiceDto
 * DTO para atualização parcial de uma cobrança.
 * Permite alterar status, descontos, multas, juros e observações.
 */
export class UpdateInvoiceDto {
  // Novo status da cobrança
  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  // Valor de desconto a aplicar
  @ApiPropertyOptional({ example: 10.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  // Valor de multa por atraso
  @ApiPropertyOptional({ example: 5.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fine?: number;

  // Valor de juros por atraso
  @ApiPropertyOptional({ example: 2.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  interest?: number;

  // Observações internas
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;
}
