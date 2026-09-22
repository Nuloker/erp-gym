import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';

// Entidades do banco de dados
import { Tenant } from './modules/tenants/entities/tenant.entity';
import { User } from './modules/users/entities/user.entity';
import { Student } from './modules/students/entities/student.entity';
import { Plan } from './modules/plans/entities/plan.entity';
import { Enrollment } from './modules/enrollments/entities/enrollment.entity';
import { Invoice } from './modules/finance/entities/invoice.entity';
import { Payment } from './modules/finance/entities/payment.entity';
import { Attendance } from './modules/attendance/entities/attendance.entity';
import { Modality } from './modules/classes/entities/modality.entity';
import { ClassGroup } from './modules/classes/entities/class-group.entity';
import { ClassSchedule } from './modules/classes/entities/class-schedule.entity';
import { ClassEnrollment } from './modules/classes/entities/class-enrollment.entity';
import { WorkoutPlan } from './modules/workouts/entities/workout-plan.entity';
import { WorkoutExercise } from './modules/workouts/entities/workout-exercise.entity';
import { PhysicalAssessment } from './modules/assessments/entities/physical-assessment.entity';
import { AuditLog } from './modules/audit/entities/audit-log.entity';

// Módulos de negócio
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { PlansModule } from './modules/plans/plans.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { FinanceModule } from './modules/finance/finance.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ClassesModule } from './modules/classes/classes.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { AuditModule } from './modules/audit/audit.module';

// Interceptor global de auditoria
import { AuditInterceptor } from './modules/audit/audit.interceptor';

/**
 * AppModule
 * Módulo raiz da aplicação NestJS.
 *
 * Responsabilidades:
 * - Carregar variáveis de ambiente via ConfigModule
 * - Configurar conexão com o banco MySQL via TypeORM
 * - Registrar todas as entidades gerenciadas pelo ORM
 * - Importar todos os módulos de negócio da aplicação
 * - Registrar o AuditInterceptor globalmente via APP_INTERCEPTOR
 *
 * Observações importantes:
 * - synchronize: true cria/atualiza tabelas automaticamente no banco
 *   NUNCA usar em produção — substituir por migrations
 * - logging: false desativa exibição de queries SQL no terminal
 * - Toda nova entidade deve ser adicionada ao array entities[]
 * - Todo novo módulo deve ser adicionado ao array imports[]
 */
@Module({
  imports: [
    // ── CONFIGURAÇÃO GLOBAL ──────────────────────────────
    // Carrega as variáveis do arquivo .env e disponibiliza
    // globalmente em todos os módulos sem necessidade de reimportar
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ── BANCO DE DADOS ───────────────────────────────────
    // Configura a conexão com o MySQL via TypeORM de forma assíncrona,
    // aguardando o ConfigModule carregar as variáveis de ambiente
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT', '3307')),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),

        // Todas as entidades gerenciadas pelo TypeORM.
        // Cada nova entidade criada no projeto deve ser registrada aqui
        // para que o TypeORM reconheça e gerencie sua tabela no banco.
        entities: [
          // ── Identidade e acesso ──
          Tenant, // Academia/unidade (multi-tenant)
          User, // Usuários internos do sistema

          // ── Alunos ──
          Student, // Cadastro completo do aluno

          // ── Planos e matrículas ──
          Plan, // Planos oferecidos pela academia
          Enrollment, // Matrículas dos alunos nos planos

          // ── Financeiro ──
          Invoice, // Cobranças/mensalidades
          Payment, // Baixas de pagamento

          // ── Presença ──
          Attendance, // Registros de check-in

          // ── Turmas e aulas ──
          Modality, // Modalidades (Musculação, Funcional, etc.)
          ClassGroup, // Turmas vinculadas a modalidades
          ClassSchedule, // Horários recorrentes das turmas
          ClassEnrollment, // Inscrições de alunos nas turmas

          // ── Avaliações físicas ──
          PhysicalAssessment, // Avaliações físicas dos alunos

          // ── Treinos ──
          WorkoutPlan, // Fichas de treino dos alunos
          WorkoutExercise, // Exercícios de cada ficha

          // ── Auditoria ──
          AuditLog, // Logs de ações críticas do sistema
        ],

        // true = cria/atualiza tabelas automaticamente ao iniciar
        // ATENÇÃO: desativar antes de qualquer deploy em produção
        // e substituir por migrations versionadas
        synchronize: true,

        // false = não exibe queries SQL no terminal
        // Alterar para true temporariamente para depurar queries
        logging: false,
      }),
      inject: [ConfigService],
    }),

    // ── MÓDULOS DE NEGÓCIO ───────────────────────────────
    // Cada módulo encapsula um domínio completo da aplicação
    // com suas próprias entidades, services, controllers e DTOs

    // Auditoria — DEVE ser o primeiro para estar disponível globalmente
    AuditModule,

    // Autenticação — login, JWT, guards
    AuthModule,

    // Gestão de usuários internos (admin, professor, recepção, financeiro)
    UsersModule,

    // Gestão de alunos — cadastro, busca, status
    StudentsModule,

    // Gestão de planos — tipos de planos e configurações
    PlansModule,

    // Matrículas — vínculo aluno/plano, renovação, cancelamento
    EnrollmentsModule,

    // Financeiro — cobranças, pagamentos, inadimplência
    FinanceModule,

    // Presença — check-in manual e histórico de frequência
    AttendanceModule,

    // Dashboard — indicadores e resumos gerenciais
    DashboardModule,

    // Turmas e aulas — modalidades, grupos, horários, inscrições
    ClassesModule,

    // Fichas de treino — planos de treino e exercícios por aluno
    WorkoutsModule,

    // Avaliações físicas — registro de medidas e evolução dos alunos
    AssessmentsModule,
  ],

  providers: [
    // ── INTERCEPTOR GLOBAL DE AUDITORIA ─────────────────
    // Registrado via APP_INTERCEPTOR para capturar automaticamente
    // todas as requisições POST, PATCH, DELETE da aplicação
    // sem necessidade de alterar nenhum módulo existente.
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
