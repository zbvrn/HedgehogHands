import { IntegrationTestBase } from '../infrastructure/test-base';

describe('Announcements integration', () => {
  const base = new (class extends IntegrationTestBase {})();

  beforeAll(() => base.setup());
  beforeEach(() => base.resetDatabase());
  afterAll(() => base.close());

  it('Helper creates announcement successfully', async () => {
    const helper = await base.seeder.seedHelperUser();
    const token = await base.auth.login(helper);
    const { active } = await base.seeder.seedCategories();

    const response = await base
      .api()
      .post('/api/announcements')
      .set('Authorization', base.bearer(token))
      .send({
        title: 'Math support',
        description: 'Homework and practice',
        price: 1500,
        categoryId: active.id,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      title: 'Math support',
      helper: { id: helper.id },
      category: { id: active.id },
      isActive: true,
    });
  });

  it('Helper gets own announcements list', async () => {
    const helper = await base.seeder.seedHelperUser();
    const other = await base.seeder.seedHelperUser({
      email: 'other-helper@test.local',
      name: 'Other Helper',
    });
    const token = await base.auth.login(helper);
    const { active } = await base.seeder.seedCategories();
    await base.seeder.seedAnnouncement(helper, active, { title: 'Mine' });
    await base.seeder.seedAnnouncement(other, active, { title: 'Not mine' });

    const response = await base
      .api()
      .get('/api/announcements/my')
      .set('Authorization', base.bearer(token))
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({ title: 'Mine' });
  });

  it('Helper updates own announcement successfully', async () => {
    const helper = await base.seeder.seedHelperUser();
    const token = await base.auth.login(helper);
    const { active } = await base.seeder.seedCategories();
    const announcement = await base.seeder.seedAnnouncement(helper, active);

    const response = await base
      .api()
      .put(`/api/announcements/${announcement.id}`)
      .set('Authorization', base.bearer(token))
      .send({ title: 'Updated title', price: 1700 })
      .expect(200);

    expect(response.body).toMatchObject({ id: announcement.id, title: 'Updated title', price: 1700 });
  });

  it('Helper deletes own announcement successfully', async () => {
    const helper = await base.seeder.seedHelperUser();
    const token = await base.auth.login(helper);
    const { active } = await base.seeder.seedCategories();
    const announcement = await base.seeder.seedAnnouncement(helper, active);

    await base
      .api()
      .delete(`/api/announcements/${announcement.id}`)
      .set('Authorization', base.bearer(token))
      .expect(200);
  });

  it('Parent can view active announcements but not inactive announcement details', async () => {
    const parent = await base.seeder.seedParentUser();
    const helper = await base.seeder.seedHelperUser();
    const token = await base.auth.login(parent);
    const { active } = await base.seeder.seedCategories();
    const seeded = await base.seeder.seedAnnouncements(helper, active);

    const list = await base
      .api()
      .get('/api/announcements')
      .set('Authorization', base.bearer(token))
      .expect(200);

    expect(list.body.items.map((item: { id: number }) => item.id)).toEqual([seeded.active.id]);

    await base
      .api()
      .get(`/api/announcements/${seeded.inactive.id}`)
      .set('Authorization', base.bearer(token))
      .expect(404);
  });

  it('Admin cannot create announcement returns 403', async () => {
    const admin = await base.seeder.seedAdminUser();
    const token = await base.auth.login(admin);
    const { active } = await base.seeder.seedCategories();

    await base
      .api()
      .post('/api/announcements')
      .set('Authorization', base.bearer(token))
      .send({ title: 'Admin post', description: 'Nope', categoryId: active.id })
      .expect(403);
  });

  it('Filtering by category works', async () => {
    const parent = await base.seeder.seedParentUser();
    const helper = await base.seeder.seedHelperUser();
    const token = await base.auth.login(parent);
    const { active, inactive } = await base.seeder.seedCategories();
    await base.seeder.seedAnnouncement(helper, active, { title: 'Target category' });
    await base.seeder.seedAnnouncement(helper, inactive, { title: 'Other category', isActive: true });

    const response = await base
      .api()
      .get(`/api/announcements?categoryId=${active.id}`)
      .set('Authorization', base.bearer(token))
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({ title: 'Target category' });
  });

  it('Search by title or description works', async () => {
    const parent = await base.seeder.seedParentUser();
    const helper = await base.seeder.seedHelperUser();
    const token = await base.auth.login(parent);
    const { active } = await base.seeder.seedCategories();
    await base.seeder.seedAnnouncement(helper, active, { title: 'Speech practice' });
    await base.seeder.seedAnnouncement(helper, active, { title: 'Painting', description: 'Creative brush session' });

    const response = await base
      .api()
      .get('/api/announcements?search=brush')
      .set('Authorization', base.bearer(token))
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({ title: 'Painting' });
  });

  it('Pagination works', async () => {
    const parent = await base.seeder.seedParentUser();
    const helper = await base.seeder.seedHelperUser();
    const token = await base.auth.login(parent);
    const { active } = await base.seeder.seedCategories();
    await base.seeder.seedAnnouncement(helper, active, { title: 'First' });
    await base.seeder.seedAnnouncement(helper, active, { title: 'Second' });
    await base.seeder.seedAnnouncement(helper, active, { title: 'Third' });

    const response = await base
      .api()
      .get('/api/announcements?page=2&limit=2')
      .set('Authorization', base.bearer(token))
      .expect(200);

    expect(response.body).toMatchObject({ total: 3, page: 2, limit: 2, totalPages: 2 });
    expect(response.body.items).toHaveLength(1);
  });
});
