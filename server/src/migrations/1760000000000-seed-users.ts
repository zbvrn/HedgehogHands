import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedUsers1760000000000 implements MigrationInterface {
  name = 'SeedUsers1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'parent',
        name TEXT NOT NULL
      )
    `);

    const passwordHash = await bcrypt.hash('password123', 10);

    await queryRunner.query(
      `
        INSERT INTO users (email, password_hash, role, name)
        VALUES
          ('parent@example.com', $1, 'parent', 'Parent User'),
          ('helper@example.com', $1, 'helper', 'Helper User'),
          ('helper2@example.com', $1, 'helper', 'Helper User 2'),
          ('admin@example.com', $1, 'admin', 'Admin User')
      `,
      [passwordHash],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS users
    `);
  }
}
