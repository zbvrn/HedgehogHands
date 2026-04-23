import { IntegrationTestBase } from '../infrastructure/test-base';

describe('Platform integration', () => {
  const base = new (class extends IntegrationTestBase {})();

  beforeAll(() => base.setup());
  beforeEach(() => base.resetDatabase());
  afterAll(() => base.close());

  it('/health returns 200', async () => {
    await base.api().get('/health').expect(200).expect('ok');
  });

  it('protected endpoint without token returns 401 ProblemDetails', async () => {
    const response = await base.api().get('/api/auth/me').expect(401);

    expect(response.body).toEqual(
      expect.objectContaining({
        type: 'about:blank',
        title: expect.any(String),
        status: 401,
      }),
    );
  });
});
