import { PartialType } from '@nestjs/swagger';
import { CreateWorkoutExerciseDto } from './create-workout-exercise.dto';

export class UpdateWorkoutExerciseDto extends PartialType(
  CreateWorkoutExerciseDto,
) {}
