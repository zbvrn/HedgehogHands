import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CleanDemoData1763500000000 implements MigrationInterface {
  name = 'CleanDemoData1763500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const passwordHash = await bcrypt.hash('password123', 10);

    await queryRunner.query(
      `
        INSERT INTO users (email, password_hash, role, name)
        VALUES ('helper2@example.com', $1, 'helper', 'Helper User 2')
        ON CONFLICT (email) DO NOTHING
      `,
      [passwordHash],
    );

    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.requests') IS NOT NULL THEN
          EXECUTE 'TRUNCATE TABLE requests RESTART IDENTITY';
        END IF;
        IF to_regclass('public.announcements') IS NOT NULL THEN
          EXECUTE 'TRUNCATE TABLE announcements RESTART IDENTITY CASCADE';
        END IF;
      END $$;
    `);

    await queryRunner.query(
      `
        DELETE FROM users
        WHERE email <> ALL($1::text[])
      `,
      [['parent@example.com', 'helper@example.com', 'helper2@example.com', 'admin@example.com']],
    );

    const helperRows = (await queryRunner.query(
      `SELECT id, email FROM users WHERE email = ANY($1::text[])`,
      [['helper@example.com', 'helper2@example.com']],
    )) as Array<{ id: number; email: string }>;
    const helperIdByEmail = new Map(helperRows.map((row) => [row.email, row.id]));

    const categoryRows = (await queryRunner.query(
      `SELECT id, name FROM categories WHERE name = ANY($1::text[])`,
      [['Репетитор (математика)', 'Няня']],
    )) as Array<{ id: number; name: string }>;
    const categoryIdByName = new Map(categoryRows.map((row) => [row.name, row.id]));

    const announcements = [
      {
        helperEmail: 'helper@example.com',
        categoryName: 'Репетитор (математика)',
        title: 'Репетитор по математике',
        description: 'Помогаю школьникам разобраться с математикой, домашними заданиями и подготовкой к контрольным.',
        price: 900,
      },
      {
        helperEmail: 'helper2@example.com',
        categoryName: 'Няня',
        title: 'Няня для ребёнка',
        description: 'Присмотр за ребёнком, прогулки, спокойные игры и помощь с режимом дня.',
        price: 700,
      },
    ];

    for (const item of announcements) {
      const helperId = helperIdByEmail.get(item.helperEmail);
      const categoryId = categoryIdByName.get(item.categoryName);
      if (!helperId || !categoryId) continue;

      await queryRunner.query(
        `
          INSERT INTO announcements (title, description, price, category_id, helper_id, is_active)
          VALUES ($1, $2, $3, $4, $5, true)
        `,
        [item.title, item.description, item.price, categoryId, helperId],
      );
    }
  }

  public async down(): Promise<void> {
    // The deleted demo data should not be restored.
  }
}
