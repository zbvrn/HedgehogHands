import { IntegrationTestBase } from '../infrastructure/test-base';

describe('Request reject integration', () => {
  const base = new (class extends IntegrationTestBase {})();

  beforeAll(() => base.setup());
  beforeEach(() => base.resetDatabase());
  afterAll(() => base.close());

  async function seedContext() {
    const parent = await base.seeder.seedParentUser();
    const helper = await base.seeder.seedHelperUser();
    const { active } = await base.seeder.seedCategories();
    const { first: child } = await base.seeder.seedChildren(parent);
    const announcement = await base.seeder.seedAnnouncement(helper, active);
    return { parent, helper, child, announcement };
  }

  it('Helper rejects request with reason and reason is saved', async () => {
    const { parent, helper, child, announcement } = await seedContext();
    const request = await base.seeder.seedRequestNew(parent, child, announcement);
    const token = await base.auth.login(helper);

    const response = await base
      .api()
      .post(`/api/requests/${request.id}/reject`)
      .set('Authorization', base.bearer(token))
      .send({ reason: 'No matching time' })
      .expect(201);

    expect(response.body).toMatchObject({
      status: 'Rejected',
      rejectionReason: 'No matching time',
    });
  });

  it('Reject requires reason returns 400 if empty', async () => {
    const { parent, helper, child, announcement } = await seedContext();
    const request = await base.seeder.seedRequestNew(parent, child, announcement);
    const token = await base.auth.login(helper);

    await base
      .api()
      .post(`/api/requests/${request.id}/reject`)
      .set('Authorization', base.bearer(token))
      .send({ reason: '   ' })
      .expect(400);
  });

  it('Reject already Resolved request returns 400', async () => {
    const { parent, helper, child, announcement } = await seedContext();
    const request = await base.seeder.seedRequestResolved(parent, child, announcement);
    const token = await base.auth.login(helper);

    await base
      .api()
      .post(`/api/requests/${request.id}/reject`)
      .set('Authorization', base.bearer(token))
      .send({ reason: 'Too late' })
      .expect(400);
  });

  it('Reject already Rejected request returns 400', async () => {
    const { parent, helper, child, announcement } = await seedContext();
    const request = await base.seeder.seedRequestRejected(parent, child, announcement);
    const token = await base.auth.login(helper);

    await base
      .api()
      .post(`/api/requests/${request.id}/reject`)
      .set('Authorization', base.bearer(token))
      .send({ reason: 'Again' })
      .expect(400);
  });

  it("Reject request on another helper's announcement returns 403", async () => {
    const { parent, child, announcement } = await seedContext();
    const otherHelper = await base.seeder.seedHelperUser({
      email: 'other-helper@test.local',
      name: 'Other Helper',
    });
    const request = await base.seeder.seedRequestNew(parent, child, announcement);
    const token = await base.auth.login(otherHelper);

    await base
      .api()
      .post(`/api/requests/${request.id}/reject`)
      .set('Authorization', base.bearer(token))
      .send({ reason: 'Not mine' })
      .expect(403);
  });
});
