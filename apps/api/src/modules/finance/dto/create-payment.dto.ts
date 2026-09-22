import {
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment.entity';

/*
 * CreatePaymentDto
 * DTO para registrar um pagamento em uma cobrança existente.
 * Ao registrar o pagamento, o sistema verifica se a cobrança
 * foi totalmente quitada e atualiza o status automaticamente.
 */
export class CreatePaymentDto {
  // ID da cobrança que está sendo paga — obrigatório
  @ApiProperty({ example: 'uuid-da-cobranca' })
  @IsUUID()
  invoiceId: string;

  // Valor pago — obrigatório, mínimo 0.01
  @ApiProperty({ example: 99.9 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  // Meio de pagamento utilizado
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.PIX })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  // Data em que o pagamento foi realizado — formato ISO (YYYY-MM-DD)
  @ApiProperty({ example: '2026-04-28' })
  @IsDateString()
  paymentDate: string;

  // Observações sobre o pagamento — opcional
  @ApiPropertyOptional({ example: 'Pago via PIX' })
  @IsOptional()
  @IsString()
  observations?: string;
}
