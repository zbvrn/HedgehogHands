import { MigrationInterface, QueryRunner } from 'typeorm';
import { RequestStatus } from '../requests/request-status.enum';

type IdRow = { id: number };

export class AddRequests1763200000000 implements MigrationInterface {
  name = 'AddRequests1763200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        announcement_id INT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
        parent_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        child_id INT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
        message TEXT,
        status TEXT NOT NULL DEFAULT '${RequestStatus.NEW}',
        rejection_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_requests_announcement_parent UNIQUE (announcement_id, parent_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_requests_parent_id ON requests(parent_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status)`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_requests_announcement_id ON requests(announcement_id)`,
    );

    const parentRows = (await queryRunner.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      ['parent@example.com'],
    )) as IdRow[];
    const parentId = parentRows[0]?.id;
    if (!parentId) return;

    const childRows = (await queryRunner.query(
      `SELECT id FROM children WHERE parent_id = $1 ORDER BY id ASC`,
      [parentId],
    )) as IdRow[];
    const childIds = childRows.map((row) => row.id);
    if (!childIds.length) return;

    const announcementRows = (await queryRunner.query(
      `SELECT id FROM announcements ORDER BY id ASC LIMIT 30`,
    )) as IdRow[];
    if (!announcementRows.length) return;

    const statuses = [
      RequestStatus.NEW,
      RequestStatus.IN_PROGRESS,
      RequestStatus.RESOLVED,
      RequestStatus.REJECTED,
    ];

    for (let i = 0; i < announcementRows.length; i += 1) {
      const announcementId = announcementRows[i]!.id;
      const childId = childIds[i % childIds.length]!;
      const status = statuses[i % statuses.length]!;
      const message = `Здравствуйте! Это demo-заявка #${i + 1}.`;
      const rejectionReason = status === RequestStatus.REJECTED ? 'Нет свободных слотов' : null;

      await queryRunner.query(
        `
          INSERT INTO requests (announcement_id, parent_id, child_id, message, status, rejection_reason)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (announcement_id, parent_id) DO NOTHING
        `,
        [announcementId, parentId, childId, message, status, rejectionReason],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS requests`);
  }
}

