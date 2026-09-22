import { PartialType } from '@nestjs/swagger';
import { CreatePlanDto } from './create-plan.dto';

// Herda todos os campos do CreatePlanDto mas todos opcionais
export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
