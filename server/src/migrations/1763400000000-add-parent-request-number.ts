import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParentRequestNumber1763400000000 implements MigrationInterface {
  name = 'AddParentRequestNumber1763400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE requests
      ADD COLUMN IF NOT EXISTS parent_request_number INT
    `);

    await queryRunner.query(`
      WITH ranked AS (
        SELECT
          id,
          ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY created_at ASC, id ASC) AS rn
        FROM requests
      )
      UPDATE requests r
      SET parent_request_number = ranked.rn
      FROM ranked
      WHERE r.id = ranked.id
    `);

    await queryRunner.query(`
      UPDATE requests
      SET parent_request_number = 1
      WHERE parent_request_number IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE requests
      ALTER COLUMN parent_request_number SET NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_requests_parent_request_number
      ON requests(parent_id, parent_request_number)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_requests_parent_request_number
      ON requests(parent_id, parent_request_number)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_requests_parent_request_number
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS uq_requests_parent_request_number
    `);
    await queryRunner.query(`
      ALTER TABLE requests
      DROP COLUMN IF EXISTS parent_request_number
    `);
  }
}

