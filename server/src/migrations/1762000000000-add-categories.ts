import { MigrationInterface, QueryRunner } from 'typeorm';
import { categorySeed } from '../categories/category.seed';

export class AddCategories1762000000000 implements MigrationInterface {
  name = 'AddCategories1762000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT true
      )
    `);

    const values = categorySeed
      .map((name) => `('${name.replace(/'/g, "''")}', true)`)
      .join(', ');

    await queryRunner.query(`
      INSERT INTO categories (name, is_active)
      VALUES ${values}
      ON CONFLICT (name) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS categories
    `);
  }
}

