import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuditService } from './audit.service';

/**
 * AuditInterceptor
 * Interceptor global que registra automaticamente todas as
 * ações críticas (POST, PATCH, DELETE) no log de auditoria.
 *
 * Funciona de forma transparente — não altera nenhum módulo existente.
 * Registra tanto sucesso quanto erros.
 * Nunca bloqueia ou afeta a requisição principal.
 *
 * Campos sensíveis removidos do payload antes de persistir:
 * - password, senha, token, secret, authorization
 */

// Tipo do usuário autenticado injetado pelo JwtAuthGuard
interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId: string;
}

// Extensão do Request do Express com o usuário autenticado
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  // Métodos que devem ser auditados
  private readonly AUDITED_METHODS = ['POST', 'PATCH', 'DELETE', 'PUT'];

  // Rotas que não devem ser auditadas
  private readonly EXCLUDED_ROUTES = ['/auth/login', '/auth/refresh'];

  // Campos sensíveis removidos do payload
  private readonly SENSITIVE_FIELDS = [
    'password',
    'senha',
    'token',
    'secret',
    'authorization',
    'accessToken',
    'refreshToken',
  ];

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const method = request.method;
    const url = request.url;
    const body = request.body as Record<string, unknown>;
    const user = request.user;
    const ip = request.ip ?? '';

    // Ignora métodos não auditados
    if (!this.AUDITED_METHODS.includes(method)) {
      return next.handle();
    }

    // Ignora rotas excluídas
    if (this.EXCLUDED_ROUTES.some((r) => url.includes(r))) {
      return next.handle();
    }

    const startTime = Date.now();
    const sanitizedPayload = this.sanitizePayload(body);
    const action = this.buildAction(method, url);

    return next.handle().pipe(
      // Sucesso — registra o log com status 2xx
      tap(() => {
        const duration = Date.now() - startTime;
        const response = context.switchToHttp().getResponse<Response>();
        const statusCode = response.statusCode;

        void this.auditService.log({
          tenantId: user?.tenantId ?? undefined,
          userId: user?.id ?? undefined,
          userEmail: user?.email ?? undefined,
          method,
          route: url,
          action,
          statusCode,
          payload: sanitizedPayload
            ? JSON.stringify(sanitizedPayload)
            : undefined,
          ipAddress: ip,
          duration,
        });
      }),

      // Erro — registra o log com a mensagem de erro
      catchError((error: unknown) => {
        const duration = Date.now() - startTime;
        const err = error as { status?: number; message?: string };

        void this.auditService.log({
          tenantId: user?.tenantId ?? undefined,
          userId: user?.id ?? undefined,
          userEmail: user?.email ?? undefined,
          method,
          route: url,
          action,
          statusCode: err.status ?? 500,
          payload: sanitizedPayload
            ? JSON.stringify(sanitizedPayload)
            : undefined,
          errorMessage: err.message ?? 'Erro desconhecido',
          ipAddress: ip,
          duration,
        });

        return throwError(() => error);
      }),
    );
  }

  /**
   * Remove campos sensíveis do payload recursivamente.
   */
  private sanitizePayload(
    payload: Record<string, unknown>,
  ): Record<string, unknown> | null {
    if (!payload || typeof payload !== 'object') return null;

    const sanitized = { ...payload };
    for (const field of this.SENSITIVE_FIELDS) {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    }
    return sanitized;
  }

  /**
   * Gera um label legível para a ação.
   * Ex: POST /students → CREATE_STUDENT
   */
  private buildAction(method: string, url: string): string {
    const methodMap: Record<string, string> = {
      POST: 'CREATE',
      PATCH: 'UPDATE',
      PUT: 'UPDATE',
      DELETE: 'DELETE',
    };

    const parts = url.split('/').filter(Boolean);
    const resource =
      parts.find((p) => !p.match(/^[0-9a-f-]{36}$/i) && p !== 'api') ??
      'resource';

    return (
      (methodMap[method] ?? method) +
      '_' +
      resource.toUpperCase().replace(/-/g, '_')
    );
  }
}
