import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * UsersService
 * Camada de regras de negócio do módulo de usuários internos.
 *
 * Gerencia:
 * - Criação de usuários com hash de senha automático
 * - Listagem e busca de usuários por tenant
 * - Atualização de dados e reset de senha
 * - Ativação/desativação de usuários
 *
 * Regras principais:
 * - Email único por tenant
 * - Senha sempre hasheada com bcrypt
 * - Todas as operações isoladas por tenantId
 * - Super admin não pode ser editado por admin comum
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Cria um novo usuário interno.
   * Verifica duplicidade de email no tenant antes de criar.
   * Faz hash da senha automaticamente.
   */
  async create(dto: CreateUserDto, tenantId: string): Promise<User> {
    // Verifica se já existe usuário com esse email no tenant
    const exists = await this.userRepository.findOne({
      where: { email: dto.email, tenantId },
    });

    if (exists) {
      throw new ConflictException('Já existe um usuário com esse email');
    }

    // Hash da senha antes de persistir
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      tenantId,
    });

    const saved = await this.userRepository.save(user);

    // Remove a senha do retorno
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = saved;
    return result as User;
  }

  /**
   * Lista todos os usuários do tenant.
   * Nunca retorna a senha.
   */
  async findAll(tenantId: string): Promise<User[]> {
    const users = await this.userRepository.find({
      where: { tenantId },
      order: { name: 'ASC' },
      select: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'mustChangePassword',
        'createdAt',
        'updatedAt',
      ],
    });

    return users;
  }

  /**
   * Busca um usuário específico pelo ID.
   * Lança NotFoundException se não encontrado.
   */
  async findOne(id: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, tenantId },
      select: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'mustChangePassword',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Atualiza dados de um usuário existente.
   * Se a senha for alterada, faz hash automaticamente.
   */
  async update(
    id: string,
    dto: UpdateUserDto,
    tenantId: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica duplicidade de email ao alterar
    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepository.findOne({
        where: { email: dto.email, tenantId },
      });
      if (exists) {
        throw new ConflictException('Já existe um usuário com esse email');
      }
    }

    // Faz hash da nova senha se informada
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);

    // Remove senha do retorno
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = saved;
    return result as User;
  }

  /**
   * Desativa um usuário com soft delete.
   * Não deleta fisicamente — preserva histórico de auditoria.
   */
  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.userRepository.softDelete(id);
    return { message: 'Usuário removido com sucesso' };
  }

  /**
   * Reseta a senha de um usuário.
   * Força troca de senha no próximo login.
   */
  async resetPassword(
    id: string,
    newPassword: string,
    tenantId: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = true;
    await this.userRepository.save(user);

    return { message: 'Senha redefinida com sucesso' };
  }
}
