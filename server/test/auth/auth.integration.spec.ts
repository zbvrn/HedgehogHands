import { UserRole } from '../../src/users/user.entity';
import { IntegrationTestBase } from '../infrastructure/test-base';

describe('Auth integration', () => {
  const base = new (class extends IntegrationTestBase {})();

  beforeAll(() => base.setup());
  beforeEach(() => base.resetDatabase());
  afterAll(() => base.close());

  it('register valid data succeeds', async () => {
    const response = await base
      .api()
      .post('/api/auth/register')
      .send({
        email: 'new-parent@test.local',
        password: 'Password123!',
        name: 'New Parent',
        role: UserRole.PARENT,
      })
      .expect(201);

    expect(response.body.accessToken).toEqual(expect.any(String));
  });

  it('login wrong password returns 401', async () => {
    const parent = await base.seeder.seedParentUser();

    await base
      .api()
      .post('/api/auth/login')
      .send({ email: parent.email, password: 'Wrong123!' })
      .expect(401);
  });

  it('/api/auth/me without token returns 401', async () => {
    await base.api().get('/api/auth/me').expect(401);
  });

  it('/api/auth/me with token returns current user', async () => {
    const parent = await base.seeder.seedParentUser();
    const token = await base.auth.login(parent);

    const response = await base
      .api()
      .get('/api/auth/me')
      .set('Authorization', base.bearer(token))
      .expect(200);

    expect(response.body).toMatchObject({
      id: parent.id,
      email: parent.email,
      name: parent.name,
      role: UserRole.PARENT,
    });
  });
});
