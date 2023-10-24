import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostTable1634844827432 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "post" (
        "id" serial PRIMARY KEY,
        "title" character varying(255),
        "content" text,
        "status" character varying(255),
        "created_at" timestamp with time zone DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "post"
      ADD "userId" integer
    `);

    await queryRunner.query(`
      ALTER TABLE "post"
      ADD CONSTRAINT "FK_User"
      FOREIGN KEY ("userId")
      REFERENCES "user"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "post"
      DROP CONSTRAINT "FK_User"
    `);

    await queryRunner.query(`
      ALTER TABLE "post"
      DROP COLUMN "userId"
    `);

    await queryRunner.query(`DROP TABLE "post"`);
  }
}
