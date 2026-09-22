import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

/**
 * UsersController
 * Permissões:
 * - Todos os endpoints: apenas admin e super_admin
 * Outros roles não têm acesso ao módulo de usuários.
 */
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // aplica admin em toda a classe
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** POST /users — Criar usuário — apenas admin */
  @Post()
  @ApiOperation({ summary: 'Criar usuário interno' })
  create(@Body() dto: CreateUserDto, @Request() req) {
    return this.usersService.create(dto, req.user.tenantId);
  }

  /** GET /users — Listar usuários — apenas admin */
  @Get()
  @ApiOperation({ summary: 'Listar usuários do tenant' })
  findAll(@Request() req) {
    return this.usersService.findAll(req.user.tenantId);
  }

  /** GET /users/:id — Buscar usuário — apenas admin */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.usersService.findOne(id, req.user.tenantId);
  }

  /** PATCH /users/:id — Atualizar usuário — apenas admin */
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Request() req) {
    return this.usersService.update(id, dto, req.user.tenantId);
  }

  /** PATCH /users/:id/reset-password — apenas admin */
  @Patch(':id/reset-password')
  @ApiOperation({ summary: 'Resetar senha do usuário' })
  resetPassword(
    @Param('id') id: string,
    @Body('password') password: string,
    @Request() req,
  ) {
    return this.usersService.resetPassword(id, password, req.user.tenantId);
  }

  /** DELETE /users/:id — apenas admin */
  @Delete(':id')
  @ApiOperation({ summary: 'Remover usuário' })
  remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.user.tenantId);
  }
}
