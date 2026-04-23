import { RequestStatus } from '../../src/requests/request-status.enum';
import { IntegrationTestBase } from '../infrastructure/test-base';

describe('Request status integration', () => {
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
    return { parent, helper, child, announcement, category: active };
  }

  it('Helper changes status New to InProgress successfully', async () => {
    const { parent, helper, child, announcement } = await seedContext();
    const request = await base.seeder.seedRequestNew(parent, child, announcement);
    const token = await base.auth.login(helper);

    const response = await base
      .api()
      .patch(`/api/requests/${request.id}/status`)
      .set('Authorization', base.bearer(token))
      .send({ status: RequestStatus.IN_PROGRESS })
      .expect(200);

    expect(response.body.status).toBe(RequestStatus.IN_PROGRESS);
  });

  it('Helper changes status InProgress to Resolved successfully', async () => {
    const { parent, helper, child, announcement } = await seedContext();
    const request = await base.seeder.seedRequestInProgress(parent, child, announcement);
    const token = await base.auth.login(helper);

    const response = await base
      .api()
      .patch(`/api/requests/${request.id}/status`)
      .set('Authorization', base.bearer(token))
      .send({ status: RequestStatus.RESOLVED })
      .expect(200);

    expect(response.body.status).toBe(RequestStatus.RESOLVED);
  });

  it("Helper cannot change status of request on another helper's announcement returns 403", async () => {
    const { parent, child, announcement } = await seedContext();
    const otherHelper = await base.seeder.seedHelperUser({
      email: 'other-helper@test.local',
      name: 'Other Helper',
    });
    const request = await base.seeder.seedRequestNew(parent, child, announcement);
    const token = await base.auth.login(otherHelper);

    await base
      .api()
      .patch(`/api/requests/${request.id}/status`)
      .set('Authorization', base.bearer(token))
      .send({ status: RequestStatus.IN_PROGRESS })
      .expect(403);
  });

  it('Helper cannot change New to Resolved returns 400', async () => {
    const { parent, helper, child, announcement } = await seedContext();
    const request = await base.seeder.seedRequestNew(parent, child, announcement);
    const token = await base.auth.login(helper);

    await base
      .api()
      .patch(`/api/requests/${request.id}/status`)
      .set('Authorization', base.bearer(token))
      .send({ status: RequestStatus.RESOLVED })
      .expect(400);
  });

  it('Helper cannot change same status returns 400', async () => {
    const { parent, helper, child, announcement } = await seedContext();
    const request = await base.seeder.seedRequestNew(parent, child, announcement);
    const token = await base.auth.login(helper);

    await base
      .api()
      .patch(`/api/requests/${request.id}/status`)
      .set('Authorization', base.bearer(token))
      .send({ status: RequestStatus.NEW })
      .expect(400);
  });

  it('Helper cannot change status of already Resolved request returns 400', async () => {
    const { parent, helper, child, announcement } = await seedContext();
    const request = await base.seeder.seedRequestResolved(parent, child, announcement);
    const token = await base.auth.login(helper);

    await base
      .api()
      .patch(`/api/requests/${request.id}/status`)
      .set('Authorization', base.bearer(token))
      .send({ status: RequestStatus.IN_PROGRESS })
      .expect(400);
  });

  it('Helper cannot change status of Rejected request returns 400', async () => {
    const { parent, helper, child, announcement } = await seedContext();
    const request = await base.seeder.seedRequestRejected(parent, child, announcement);
    const token = await base.auth.login(helper);

    await base
      .api()
      .patch(`/api/requests/${request.id}/status`)
      .set('Authorization', base.bearer(token))
      .send({ status: RequestStatus.IN_PROGRESS })
      .expect(400);
  });
});
