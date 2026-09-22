import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../apps/api/src/modules/tenants/entities/tenant.entity';
import { User, UserRole } from '../apps/api/src/modules/users/entities/user.entity';

const dataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3307,
  username: 'erp_user',
  password: 'erp_pass',
  database: 'erp_gym',
  entities: [Tenant, User],
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();
  console.log('âœ… Conectado ao banco');

  // Cria tenant
  const tenantRepo = dataSource.getRepository(Tenant);
  let tenant = await tenantRepo.findOne({ where: { name: 'Academia Demo' } });

  if (!tenant) {
    tenant = tenantRepo.create({
      name: 'Academia Demo',
      email: 'demo@academia.com',
      phone: '11999999999',
    });
    await tenantRepo.save(tenant);
    console.log('âœ… Tenant criado');
  }

  // Cria usuÃ¡rio admin
  const userRepo = dataSource.getRepository(User);
  const exists = await userRepo.findOne({ where: { email: 'admin@academia.com' } });

  if (!exists) {
    const password = await bcrypt.hash('admin123', 10);
    const user = userRepo.create({
      name: 'Administrador',
      email: 'admin@academia.com',
      password,
      role: UserRole.ADMIN,
      tenantId: tenant.id,
    });
    await userRepo.save(user);
    console.log('âœ… UsuÃ¡rio admin criado');
    console.log('ðŸ“§ Email: admin@academia.com');
    console.log('ðŸ”‘ Senha: admin123');
  } else {
    console.log('â„¹ï¸ UsuÃ¡rio admin jÃ¡ existe');
  }

  await dataSource.destroy();
  console.log('âœ… Seed finalizado!');
}

seed().catch(console.error);