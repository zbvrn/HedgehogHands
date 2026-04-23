import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { Announcement } from '../../src/announcements/announcement.entity';
import { Category } from '../../src/categories/category.entity';
import { Child } from '../../src/children/child.entity';
import { RequestEntity } from '../../src/requests/request.entity';
import { RequestStatus } from '../../src/requests/request-status.enum';
import { User, UserRole } from '../../src/users/user.entity';

type UserSeed = {
  email?: string;
  name?: string;
  password?: string;
};

export class TestDataSeeder {
  private readonly users: Repository<User>;
  private readonly categories: Repository<Category>;
  private readonly children: Repository<Child>;
  private readonly announcements: Repository<Announcement>;
  private readonly requests: Repository<RequestEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.users = dataSource.getRepository(User);
    this.categories = dataSource.getRepository(Category);
    this.children = dataSource.getRepository(Child);
    this.announcements = dataSource.getRepository(Announcement);
    this.requests = dataSource.getRepository(RequestEntity);
  }

  seedParentUser(overrides: UserSeed = {}) {
    return this.seedUser(UserRole.PARENT, {
      email: 'parent@test.local',
      name: 'Parent User',
      ...overrides,
    });
  }

  seedHelperUser(overrides: UserSeed = {}) {
    return this.seedUser(UserRole.HELPER, {
      email: 'helper@test.local',
      name: 'Helper User',
      ...overrides,
    });
  }

  seedAdminUser(overrides: UserSeed = {}) {
    return this.seedUser(UserRole.ADMIN, {
      email: 'admin@test.local',
      name: 'Admin User',
      ...overrides,
    });
  }

  async seedCategories() {
    const active = await this.categories.save(
      this.categories.create({ name: 'Speech therapy', isActive: true }),
    );
    const inactive = await this.categories.save(
      this.categories.create({ name: 'Music lessons', isActive: false }),
    );
    return { active, inactive };
  }

  async seedChildren(parent: User) {
    const first = await this.children.save(
      this.children.create({
        name: 'Mira',
        age: 7,
        features: 'Needs calm pacing',
        parentId: parent.id,
      }),
    );
    const second = await this.children.save(
      this.children.create({
        name: 'Leo',
        age: 5,
        features: null,
        parentId: parent.id,
      }),
    );
    return { first, second };
  }

  async seedAnnouncements(helper: User, category: Category) {
    const active = await this.seedAnnouncement(helper, category, {
      title: 'Gentle reading support',
      description: 'Reading and communication practice',
      price: 1200,
    });
    const inactive = await this.seedAnnouncement(helper, category, {
      title: 'Archived homework support',
      description: 'Inactive announcement',
      isActive: false,
    });
    return { active, inactive };
  }

  seedAnnouncement(
    helper: User,
    category: Category,
    overrides: Partial<Announcement> = {},
  ) {
    return this.announcements.save(
      this.announcements.create({
        title: 'Child development session',
        description: 'Careful practical help',
        price: 1000,
        categoryId: category.id,
        helperId: helper.id,
        isActive: true,
        ...overrides,
      }),
    );
  }

  seedRequestNew(parent: User, child: Child, announcement: Announcement) {
    return this.seedRequest(parent, child, announcement, RequestStatus.NEW);
  }

  seedRequestInProgress(parent: User, child: Child, announcement: Announcement) {
    return this.seedRequest(parent, child, announcement, RequestStatus.IN_PROGRESS);
  }

  seedRequestResolved(parent: User, child: Child, announcement: Announcement) {
    return this.seedRequest(parent, child, announcement, RequestStatus.RESOLVED);
  }

  seedRequestRejected(parent: User, child: Child, announcement: Announcement) {
    return this.seedRequest(parent, child, announcement, RequestStatus.REJECTED, {
      rejectionReason: 'Schedule is full',
    });
  }

  private async seedUser(role: UserRole, params: Required<UserSeed>) {
    const passwordHash = await bcrypt.hash(params.password ?? 'Password123!', 4);
    return this.users.save(
      this.users.create({
        email: params.email,
        name: params.name,
        role,
        passwordHash,
      }),
    );
  }

  private async seedRequest(
    parent: User,
    child: Child,
    announcement: Announcement,
    status: RequestStatus,
    overrides: Partial<RequestEntity> = {},
  ) {
    const count = await this.requests.count({ where: { parentId: parent.id } });
    return this.requests.save(
      this.requests.create({
        announcementId: announcement.id,
        parentId: parent.id,
        childId: child.id,
        parentRequestNumber: count + 1,
        message: 'Please contact me',
        status,
        ...overrides,
      }),
    );
  }
}
