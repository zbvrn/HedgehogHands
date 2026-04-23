import { IntegrationTestBase } from '../infrastructure/test-base';

describe('Categories integration', () => {
  const base = new (class extends IntegrationTestBase {})();

  beforeAll(() => base.setup());
  beforeEach(() => base.resetDatabase());
  afterAll(() => base.close());

  it('Admin creates category successfully', async () => {
    const admin = await base.seeder.seedAdminUser();
    const token = await base.auth.login(admin);

    const response = await base
      .api()
      .post('/api/categories')
      .set('Authorization', base.bearer(token))
      .send({ name: 'Art therapy' })
      .expect(201);

    expect(response.body).toMatchObject({ name: 'Art therapy', isActive: true });
  });

  it('duplicate name returns 409', async () => {
    const admin = await base.seeder.seedAdminUser();
    const token = await base.auth.login(admin);
    await base.seeder.seedCategories();

    await base
      .api()
      .post('/api/categories')
      .set('Authorization', base.bearer(token))
      .send({ name: 'Speech therapy' })
      .expect(409);
  });

  it('empty or whitespace name returns 400', async () => {
    const admin = await base.seeder.seedAdminUser();
    const token = await base.auth.login(admin);

    await base
      .api()
      .post('/api/categories')
      .set('Authorization', base.bearer(token))
      .send({ name: '   ' })
      .expect(400);
  });

  it('Parent sees only active categories', async () => {
    const parent = await base.seeder.seedParentUser();
    const token = await base.auth.login(parent);
    await base.seeder.seedCategories();

    const response = await base
      .api()
      .get('/api/categories')
      .set('Authorization', base.bearer(token))
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ name: 'Speech therapy', isActive: true });
  });

  it('Admin with includeInactive=true sees all categories', async () => {
    const admin = await base.seeder.seedAdminUser();
    const token = await base.auth.login(admin);
    await base.seeder.seedCategories();

    const response = await base
      .api()
      .get('/api/categories?includeInactive=true')
      .set('Authorization', base.bearer(token))
      .expect(200);

    expect(response.body.map((category: { name: string }) => category.name)).toEqual([
      'Music lessons',
      'Speech therapy',
    ]);
  });
});
