import { MigrationInterface, QueryRunner } from 'typeorm';

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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM users WHERE email = ANY($1::text[])`,
      [['parent2@example.com', 'parent3@example.com', 'parent4@example.com']],
    );
  }
}
