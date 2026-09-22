import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

/**
 * PlansService
 * Camada de regras de negócio do módulo de planos.
 * Responsável por criar, listar, buscar, atualizar e remover planos.
 * Todas as operações são isoladas por tenantId (multi-tenant).
 */
@Injectable()
export class PlansService {
  constructor(
    // Injeta o repositório da entidade Plan
    // Permite fazer queries no banco via TypeORM
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  /**
   * Cria um novo plano vinculado ao tenant autenticado.
   * Verifica se já existe um plano com o mesmo nome no tenant.
   */
  async create(createPlanDto: CreatePlanDto, tenantId: string) {
    // Verifica duplicidade de nome dentro do mesmo tenant
    const exists = await this.planRepository.findOne({
      where: { name: createPlanDto.name, tenantId },
    });

    if (exists) {
      throw new ConflictException('Já existe um plano com esse nome');
    }

    // Cria a instância do plano com os dados recebidos + tenantId
    const plan = this.planRepository.create({
      ...createPlanDto,
      tenantId,
    });

    // Persiste no banco e retorna o plano criado
    return this.planRepository.save(plan);
  }

  /**
   * Lista todos os planos do tenant autenticado.
   * Filtra opcionalmente por isActive.
   * Ordena por nome em ordem alfabética.
   */
  async findAll(tenantId: string, isActive?: boolean) {
    const where: FindOptionsWhere<Plan> = { tenantId };

    // Aplica filtro de status ativo se informado
    if (isActive !== undefined) where.isActive = isActive;

    return this.planRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  /**
   * Busca um plano específico pelo ID dentro do tenant.
   * Lança NotFoundException se não encontrado.
   */
  async findOne(id: string, tenantId: string) {
    const plan = await this.planRepository.findOne({
      where: { id, tenantId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    return plan;
  }

  /**
   * Atualiza os dados de um plano existente.
   * Usa Object.assign para aplicar apenas os campos enviados.
   */
  async update(id: string, updatePlanDto: UpdatePlanDto, tenantId: string) {
    // Busca o plano — lança erro se não existir
    const plan = await this.findOne(id, tenantId);

    // Aplica as alterações na instância existente
    Object.assign(plan, updatePlanDto);

    // Salva e retorna o plano atualizado
    return this.planRepository.save(plan);
  }

  /**
   * Remove um plano com soft delete.
   * O registro não é deletado fisicamente — apenas marcado com deletedAt.
   * Isso preserva o histórico de matrículas vinculadas ao plano.
   */
  async remove(id: string, tenantId: string) {
    const plan = await this.findOne(id, tenantId);
    await this.planRepository.softDelete(plan.id);
    return { message: 'Plano removido com sucesso' };
  }
}
