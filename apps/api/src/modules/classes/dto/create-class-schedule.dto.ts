import { IsString, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * CreateClassScheduleDto
 * DTO para criação de um horário recorrente de uma turma.
 *
 * dayOfWeek segue padrão JavaScript:
 * 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
 */
export class CreateClassScheduleDto {
  // ID da turma que receberá o horário — obrigatório
  @ApiProperty({ example: 'uuid-da-turma' })
  @IsUUID()
  classGroupId: string;

  // Dia da semana: 0=Domingo até 6=Sábado
  @ApiProperty({
    example: 1,
    description: '0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab',
  })
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  // Hora de início no formato HH:mm
  @ApiProperty({ example: '07:00' })
  @IsString()
  startTime: string;

  // Hora de término no formato HH:mm
  @ApiProperty({ example: '08:00' })
  @IsString()
  endTime: string;
}
