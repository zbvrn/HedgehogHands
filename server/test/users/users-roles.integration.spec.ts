import { UserRole } from '../../src/users/user.entity';
import { IntegrationTestBase } from '../infrastructure/test-base';

describe('Users roles integration', () => {
  const base = new (class extends IntegrationTestBase {})();

  beforeAll(() => base.setup());
  beforeEach(() => base.resetDatabase());
  afterAll(() => base.close());

  it('Admin gets list of parents succeeds', async () => {
    const admin = await base.seeder.seedAdminUser();
    const parent = await base.seeder.seedParentUser();
    const token = await base.auth.login(admin);

    const response = await base
      .api()
      .get('/api/users/parents')
      .set('Authorization', base.bearer(token))
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({ id: parent.id, role: UserRole.PARENT }),
    ]);
  });

  it('Admin gets list of helpers succeeds', async () => {
    const admin = await base.seeder.seedAdminUser();
    const helper = await base.seeder.seedHelperUser();
    const token = await base.auth.login(admin);

    const response = await base
      .api()
      .get('/api/users/helpers')
      .set('Authorization', base.bearer(token))
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({ id: helper.id, role: UserRole.HELPER }),
    ]);
  });

  it('valid role change succeeds and leaves exactly one role', async () => {
    const admin = await base.seeder.seedAdminUser();
    const parent = await base.seeder.seedParentUser();
    const token = await base.auth.login(admin);

    const response = await base
      .api()
      .put(`/api/users/${parent.id}/role`)
      .set('Authorization', base.bearer(token))
      .send({ role: UserRole.HELPER })
      .expect(200);

    expect(response.body).toMatchObject({ id: parent.id, role: UserRole.HELPER });
    expect(response.body).not.toHaveProperty('roles');
  });

  it('nonexistent user returns 404', async () => {
    const admin = await base.seeder.seedAdminUser();
    const token = await base.auth.login(admin);

    await base
      .api()
      .put('/api/users/999/role')
      .set('Authorization', base.bearer(token))
      .send({ role: UserRole.HELPER })
      .expect(404);
  });

  it('invalid role returns 400', async () => {
    const admin = await base.seeder.seedAdminUser();
    const parent = await base.seeder.seedParentUser();
    const token = await base.auth.login(admin);

    await base
      .api()
      .put(`/api/users/${parent.id}/role`)
      .set('Authorization', base.bearer(token))
      .send({ role: 'moderator' })
      .expect(400);
  });

  it('non-admin cannot change role returns 403', async () => {
    const parent = await base.seeder.seedParentUser();
    const other = await base.seeder.seedParentUser({
      email: 'other-parent@test.local',
      name: 'Other Parent',
    });
    const token = await base.auth.login(parent);

    await base
      .api()
      .put(`/api/users/${other.id}/role`)
      .set('Authorization', base.bearer(token))
      .send({ role: UserRole.HELPER })
      .expect(403);
  });
});
