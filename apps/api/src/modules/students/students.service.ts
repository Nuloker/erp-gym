import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto, tenantId: string) {
    const exists = await this.studentRepository.findOne({
      where: { email: createStudentDto.email, tenantId },
    });

    if (exists) {
      throw new ConflictException('Email já cadastrado');
    }

    const student = this.studentRepository.create({
      ...createStudentDto,
      tenantId,
    });

    return this.studentRepository.save(student);
  }

  async findAll(tenantId: string, status?: string) {
    const where: FindOptionsWhere<Student> = { tenantId };
    if (status) where.status = status as Student['status'];

    return this.studentRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const student = await this.studentRepository.findOne({
      where: { id, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return student;
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
    tenantId: string,
  ) {
    const student = await this.findOne(id, tenantId);
    Object.assign(student, updateStudentDto);
    return this.studentRepository.save(student);
  }

  async remove(id: string, tenantId: string) {
    const student = await this.findOne(id, tenantId);
    await this.studentRepository.softDelete(student.id);
    return { message: 'Aluno removido com sucesso' };
  }
}
