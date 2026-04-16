import { MigrationInterface, QueryRunner } from 'typeorm';
import { RequestStatus } from '../requests/request-status.enum';

type IdRow = { id: number };
type UserRow = { id: number; email: string };
type ChildRow = { id: number; parent_id: number };

export class SeedMoreRequests1763300000000 implements MigrationInterface {
  name = 'SeedMoreRequests1763300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure we have a unique constraint for (announcement_id, parent_id) so ON CONFLICT works.
    // Some environments might have created the table without this constraint (e.g. via synchronize).
    await queryRunner.query(`
      DELETE FROM requests r
      USING requests r2
      WHERE r.announcement_id = r2.announcement_id
        AND r.parent_id = r2.parent_id
        AND r.id > r2.id
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_requests_announcement_parent_idx
      ON requests(announcement_id, parent_id)
    `);

    const passwordRows = (await queryRunner.query(
      `SELECT password_hash FROM users WHERE email = $1 LIMIT 1`,
      ['parent@example.com'],
    )) as Array<{ password_hash: string }>;
    const passwordHash = passwordRows[0]?.password_hash;
    if (!passwordHash) return;

    await queryRunner.query(
      `
        INSERT INTO users (email, password_hash, role, name)
        VALUES
          ('parent2@example.com', $1, 'parent', 'Parent User 2'),
          ('parent3@example.com', $1, 'parent', 'Parent User 3'),
          ('parent4@example.com', $1, 'parent', 'Parent User 4')
        ON CONFLICT (email) DO NOTHING
      `,
      [passwordHash],
    );

    const userRows = (await queryRunner.query(
      `SELECT id, email FROM users WHERE email = ANY($1::text[]) ORDER BY id ASC`,
      [['parent@example.com', 'parent2@example.com', 'parent3@example.com', 'parent4@example.com']],
    )) as UserRow[];
    if (!userRows.length) return;

    const helperRows = (await queryRunner.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      ['helper@example.com'],
    )) as IdRow[];
    const helperId = helperRows[0]?.id;
    if (!helperId) return;

    for (const user of userRows) {
      const childName = user.email === 'parent@example.com' ? 'Маша' : `Child of ${user.email}`;
      await queryRunner.query(
        `
          INSERT INTO children (name, age, features, parent_id)
          SELECT $1, $2, $3, $4
          WHERE NOT EXISTS (
            SELECT 1 FROM children WHERE parent_id = $4 AND name = $1
          )
        `,
        [childName, 7, 'demo', user.id],
      );
    }

    const childRows = (await queryRunner.query(
      `SELECT id, parent_id FROM children WHERE parent_id = ANY($1::int[]) ORDER BY id ASC`,
      [userRows.map((row) => row.id)],
    )) as ChildRow[];

    const firstChildIdByParent = new Map<number, number>();
    for (const row of childRows) {
      if (!firstChildIdByParent.has(row.parent_id)) {
        firstChildIdByParent.set(row.parent_id, row.id);
      }
    }

    const announcementRows = (await queryRunner.query(
      `SELECT id FROM announcements WHERE helper_id = $1 ORDER BY id ASC LIMIT 30`,
      [helperId],
    )) as IdRow[];
    if (!announcementRows.length) return;

    const statuses = [
      RequestStatus.NEW,
      RequestStatus.IN_PROGRESS,
      RequestStatus.RESOLVED,
      RequestStatus.REJECTED,
    ];

    for (let p = 0; p < userRows.length; p += 1) {
      const parent = userRows[p]!;
      const childId = firstChildIdByParent.get(parent.id);
      if (!childId) continue;

      for (let i = 0; i < announcementRows.length; i += 1) {
        const announcementId = announcementRows[i]!.id;
        const status = statuses[(p * announcementRows.length + i) % statuses.length]!;
        const message = `Здравствуйте! Это demo-заявка P${p + 1}-A${i + 1}.`;
        const rejectionReason = status === RequestStatus.REJECTED ? 'Нет свободных слотов' : null;

        await queryRunner.query(
          `
            INSERT INTO requests (announcement_id, parent_id, child_id, message, status, rejection_reason)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (announcement_id, parent_id) DO NOTHING
          `,
          [announcementId, parent.id, childId, message, status, rejectionReason],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM users WHERE email = ANY($1::text[])`,
      [['parent2@example.com', 'parent3@example.com', 'parent4@example.com']],
    );
  }
}
