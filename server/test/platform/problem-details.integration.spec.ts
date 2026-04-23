import { IntegrationTestBase } from '../infrastructure/test-base';

describe('ProblemDetails integration', () => {
  const base = new (class extends IntegrationTestBase {})();

  beforeAll(() => base.setup());
  beforeEach(() => base.resetDatabase());
  afterAll(() => base.close());

  it('validation errors use RFC 7807-like JSON shape', async () => {
    const admin = await base.seeder.seedAdminUser();
    const token = await base.auth.login(admin);

    const response = await base
      .api()
      .post('/api/categories')
      .set('Authorization', base.bearer(token))
      .send({})
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        type: 'about:blank',
        title: 'Validation error',
        status: 400,
        detail: expect.any(String),
      }),
    );
  });
});
