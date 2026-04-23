import { IntegrationTestBase } from '../infrastructure/test-base';

describe('Requests integration', () => {
  const base = new (class extends IntegrationTestBase {})();

  beforeAll(() => base.setup());
  beforeEach(() => base.resetDatabase());
  afterAll(() => base.close());

  async function seedRequestContext() {
    const parent = await base.seeder.seedParentUser();
    const helper = await base.seeder.seedHelperUser();
    const { active } = await base.seeder.seedCategories();
    const { first: child } = await base.seeder.seedChildren(parent);
    const announcement = await base.seeder.seedAnnouncement(helper, active);
    return { parent, helper, category: active, child, announcement };
  }

  it('Parent creates request successfully with status New', async () => {
    const { parent, child, announcement } = await seedRequestContext();
    const token = await base.auth.login(parent);

    const response = await base
      .api()
      .post('/api/requests')
      .set('Authorization', base.bearer(token))
      .send({ announcementId: announcement.id, childId: child.id, message: 'Need help' })
      .expect(201);

    expect(response.body).toMatchObject({
      status: 'New',
      announcement: { id: announcement.id },
      child: { id: child.id },
      parent: { id: parent.id },
    });
  });

  it('Parent cannot create duplicate request on same announcement returns 409', async () => {
    const { parent, child, announcement } = await seedRequestContext();
    const token = await base.auth.login(parent);
    await base.seeder.seedRequestNew(parent, child, announcement);

    await base
      .api()
      .post('/api/requests')
      .set('Authorization', base.bearer(token))
      .send({ announcementId: announcement.id, childId: child.id })
      .expect(409);
  });

  it('Parent cannot create request on own announcement returns 400', async () => {
    const parent = await base.seeder.seedParentUser();
    const { active } = await base.seeder.seedCategories();
    const { first: child } = await base.seeder.seedChildren(parent);
    const ownAnnouncement = await base.seeder.seedAnnouncement(parent, active);
    const token = await base.auth.login(parent);

    await base
      .api()
      .post('/api/requests')
      .set('Authorization', base.bearer(token))
      .send({ announcementId: ownAnnouncement.id, childId: child.id })
      .expect(400);
  });

  it("Parent cannot access another parent's request returns 404", async () => {
    const { parent, child, announcement } = await seedRequestContext();
    const other = await base.seeder.seedParentUser({
      email: 'other-parent@test.local',
      name: 'Other Parent',
    });
    const request = await base.seeder.seedRequestNew(parent, child, announcement);
    const token = await base.auth.login(other);

    await base
      .api()
      .get(`/api/requests/${request.id}`)
      .set('Authorization', base.bearer(token))
      .expect(404);
  });

  it('Helper can view requests on own announcements only', async () => {
    const { parent, helper, child, announcement, category } = await seedRequestContext();
    const otherHelper = await base.seeder.seedHelperUser({
      email: 'other-helper@test.local',
      name: 'Other Helper',
    });
    const otherAnnouncement = await base.seeder.seedAnnouncement(otherHelper, category);
    await base.seeder.seedRequestNew(parent, child, announcement);
    await base.seeder.seedRequestNew(parent, child, otherAnnouncement);
    const token = await base.auth.login(helper);

    const response = await base
      .api()
      .get('/api/requests')
      .set('Authorization', base.bearer(token))
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({ announcement: { id: announcement.id } });
  });

  it("Helper cannot view request on another helper's announcement returns 403", async () => {
    const { parent, child, announcement } = await seedRequestContext();
    const otherHelper = await base.seeder.seedHelperUser({
      email: 'other-helper@test.local',
      name: 'Other Helper',
    });
    const request = await base.seeder.seedRequestNew(parent, child, announcement);
    const token = await base.auth.login(otherHelper);

    await base
      .api()
      .get(`/api/requests/${request.id}`)
      .set('Authorization', base.bearer(token))
      .expect(403);
  });

  it('Pagination works for requests list', async () => {
    const { parent, helper, child, announcement, category } = await seedRequestContext();
    const secondAnnouncement = await base.seeder.seedAnnouncement(helper, category, { title: 'Second' });
    const thirdAnnouncement = await base.seeder.seedAnnouncement(helper, category, { title: 'Third' });
    await base.seeder.seedRequestNew(parent, child, announcement);
    await base.seeder.seedRequestNew(parent, child, secondAnnouncement);
    await base.seeder.seedRequestNew(parent, child, thirdAnnouncement);
    const token = await base.auth.login(helper);

    const response = await base
      .api()
      .get('/api/requests?page=2&limit=2')
      .set('Authorization', base.bearer(token))
      .expect(200);

    expect(response.body).toMatchObject({ total: 3, page: 2, limit: 2, totalPages: 2 });
    expect(response.body.items).toHaveLength(1);
  });
});
