import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

/**
 * Decorator @Roles()
 * Define quais roles têm acesso a um endpoint específico.
 * Usado em conjunto com o RolesGuard.
 *
 * Exemplo:
 * @Roles(UserRole.ADMIN, UserRole.TEACHER)
 * @Get('plans')
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
