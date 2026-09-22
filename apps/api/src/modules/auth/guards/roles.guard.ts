import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

/**
 * RolesGuard
 * Guard que verifica se o usuário autenticado tem o role
 * necessário para acessar um endpoint.
 *
 * Deve ser usado APÓS o JwtAuthGuard, pois depende do
 * req.user preenchido pelo JWT.
 *
 * Se nenhum @Roles() for definido no endpoint, permite acesso.
 * Se @Roles() for definido, verifica se o role do usuário está na lista.
 * SUPER_ADMIN e ADMIN sempre têm acesso total.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Busca os roles definidos no decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não há @Roles() definido, permite acesso livre
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Super admin e admin têm acesso a tudo
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
      return true;
    }

    // Verifica se o role do usuário está na lista de roles permitidos
    const hasRole = requiredRoles.includes(user.role as UserRole);

    if (!hasRole) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este recurso',
      );
    }

    return true;
  }
}
