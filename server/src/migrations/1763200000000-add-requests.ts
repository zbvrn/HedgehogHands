import { MigrationInterface, QueryRunner } from 'typeorm';
import { RequestStatus } from '../requests/request-status.enum';

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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS requests`);
  }
}

