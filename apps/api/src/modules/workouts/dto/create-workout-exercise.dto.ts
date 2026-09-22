import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsPositive,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateWorkoutExerciseDto {
  @ApiProperty({ example: 'uuid-da-ficha' })
  @IsUUID()
  workoutPlanId: string;

  @ApiProperty({ example: 'Supino Reto' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Peito' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  muscleGroup?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  sets?: number;

  @ApiPropertyOptional({ example: '8-12' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  reps?: string;

  @ApiPropertyOptional({ example: 80.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  load?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  restSeconds?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional({ example: 'Manter escápulas retraídas' })
  @IsOptional()
  @IsString()
  observations?: string;
}
