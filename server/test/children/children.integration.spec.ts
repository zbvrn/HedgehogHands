import { IntegrationTestBase } from '../infrastructure/test-base';

describe('Children integration', () => {
  const base = new (class extends IntegrationTestBase {})();

  beforeAll(() => base.setup());
  beforeEach(() => base.resetDatabase());
  afterAll(() => base.close());

  it('Parent creates child successfully', async () => {
    const parent = await base.seeder.seedParentUser();
    const token = await base.auth.login(parent);

    const response = await base
      .api()
      .post('/api/children')
      .set('Authorization', base.bearer(token))
      .send({ name: 'Nika', age: 6, features: 'Allergy note' })
      .expect(201);

    expect(response.body).toMatchObject({ name: 'Nika', age: 6, parentId: parent.id });
  });

  it('Parent gets own children list', async () => {
    const parent = await base.seeder.seedParentUser();
    const token = await base.auth.login(parent);
    await base.seeder.seedChildren(parent);

    const response = await base
      .api()
      .get('/api/children')
      .set('Authorization', base.bearer(token))
      .expect(200);

    expect(response.body).toHaveLength(2);
  });

  it("Parent cannot access another parent's child returns 404", async () => {
    const parent = await base.seeder.seedParentUser();
    const other = await base.seeder.seedParentUser({
      email: 'other-parent@test.local',
      name: 'Other Parent',
    });
    const token = await base.auth.login(parent);
    const { first } = await base.seeder.seedChildren(other);

    await base
      .api()
      .get(`/api/children/${first.id}`)
      .set('Authorization', base.bearer(token))
      .expect(404);
  });

  it('Parent updates own child successfully', async () => {
    const parent = await base.seeder.seedParentUser();
    const token = await base.auth.login(parent);
    const { first } = await base.seeder.seedChildren(parent);

    const response = await base
      .api()
      .put(`/api/children/${first.id}`)
      .set('Authorization', base.bearer(token))
      .send({ name: 'Mira Updated', age: 8 })
      .expect(200);

    expect(response.body).toMatchObject({ id: first.id, name: 'Mira Updated', age: 8 });
  });

  it('Parent deletes own child successfully', async () => {
    const parent = await base.seeder.seedParentUser();
    const token = await base.auth.login(parent);
    const { first } = await base.seeder.seedChildren(parent);

    await base
      .api()
      .delete(`/api/children/${first.id}`)
      .set('Authorization', base.bearer(token))
      .expect(200);

    await base
      .api()
      .get(`/api/children/${first.id}`)
      .set('Authorization', base.bearer(token))
      .expect(404);
  });

  it('Helper cannot create child returns 403', async () => {
    const helper = await base.seeder.seedHelperUser();
    const token = await base.auth.login(helper);

    await base
      .api()
      .post('/api/children')
      .set('Authorization', base.bearer(token))
      .send({ name: 'Nika', age: 6 })
      .expect(403);
  });
});
