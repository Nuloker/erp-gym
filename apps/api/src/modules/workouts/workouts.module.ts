import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { WorkoutExercise } from './entities/workout-exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutPlan, WorkoutExercise])],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
