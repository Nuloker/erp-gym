import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';

/**
 * StudentsModule
 * Módulo responsável por toda a gestão de alunos.
 * Registra a entidade Student no TypeORM para que o
 * StudentRepository fique disponível via injeção de dependência.
 */
@Module({
  imports: [
    // Registra a entidade Student neste módulo
    // Isso cria o repositório automaticamente via TypeORM
    TypeOrmModule.forFeature([Student]),
  ],

  // Controller que recebe as requisições HTTP
  controllers: [StudentsController],

  // Service que contém as regras de negócio
  providers: [StudentsService],

  // Exporta o service para caso outros módulos precisem usar
  exports: [StudentsService],
})
export class StudentsModule {}
