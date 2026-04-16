import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChildren1763000000000 implements MigrationInterface {
  name = 'AddChildren1763000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS children (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        age INT NOT NULL,
        features TEXT,
        parent_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id)`);

    const parents = (await queryRunner.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      ['parent@example.com'],
    )) as Array<{ id: number }>;
    const parentId = parents[0]?.id;
    if (!parentId) return;

    await queryRunner.query(
      `
        INSERT INTO children (name, age, features, parent_id)
        VALUES
          ('Маша', 5, 'Аллергия на кошек', $1),
          ('Саша', 8, 'Любит математику и конструкторы', $1)
        ON CONFLICT DO NOTHING
      `,
      [parentId],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS children`);
  }
}

