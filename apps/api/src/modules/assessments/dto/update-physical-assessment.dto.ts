import { PartialType } from '@nestjs/swagger';
import { CreatePhysicalAssessmentDto } from './create-physical-assessment.dto';

/**
 * UpdatePhysicalAssessmentDto
 * Todos os campos tornam-se opcionais para atualização parcial.
 */
export class UpdatePhysicalAssessmentDto extends PartialType(
  CreatePhysicalAssessmentDto,
) {}
