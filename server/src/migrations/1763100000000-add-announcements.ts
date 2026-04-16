import { MigrationInterface, QueryRunner } from 'typeorm';

type NamedRow = { id: number };

export class AddAnnouncements1763100000000 implements MigrationInterface {
  name = 'AddAnnouncements1763100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price INT,
        category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        helper_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_announcements_category_id ON announcements(category_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_announcements_helper_id ON announcements(helper_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active)`,
    );

    const helpers = (await queryRunner.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      ['helper@example.com'],
    )) as NamedRow[];
    const helperId = helpers[0]?.id;
    if (!helperId) return;

    const categoryNames = [
      'Няня',
      'Репетитор (математика)',
      'Репетитор (английский)',
      'Психолог',
      'Логопед',
      'Уборка',
      'Помощь по дому',
    ];

    const categoryRows = (await queryRunner.query(
      `SELECT id, name FROM categories WHERE name = ANY($1::text[])`,
      [categoryNames],
    )) as Array<{ id: number; name: string }>;
    const categoryIdByName = new Map(categoryRows.map((row) => [row.name, row.id]));

    const announcements: Array<{
      title: string;
      description: string;
      price: number | null;
      categoryName: string;
      isActive: boolean;
    }> = [];

    for (let i = 1; i <= 30; i += 1) {
      const categoryName = categoryNames[(i - 1) % categoryNames.length]!;
      const price = i % 3 === 0 ? null : 500 + i * 25;
      const isActive = i % 7 !== 0; // немного неактивных для проверки
      announcements.push({
        title: `Услуга #${i}: ${categoryName}`,
        description: `Demo объявление для проверки пагинации. Номер: ${i}.`,
        price,
        categoryName,
        isActive,
      });
    }

    for (const item of announcements) {
      const categoryId = categoryIdByName.get(item.categoryName);
      if (!categoryId) continue;
      await queryRunner.query(
        `
          INSERT INTO announcements (title, description, price, category_id, helper_id, is_active)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [item.title, item.description, item.price, categoryId, helperId, item.isActive],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS announcements`);
  }
}

