import { PartialType } from '@nestjs/swagger';
import { CreateModalityDto } from './create-modality.dto';

/**
 * UpdateModalityDto
 * Todos os campos de criação tornam-se opcionais para atualização parcial.
 */
export class UpdateModalityDto extends PartialType(CreateModalityDto) {}
