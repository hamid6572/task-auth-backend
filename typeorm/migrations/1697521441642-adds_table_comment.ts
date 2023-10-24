import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentTable1635145656377 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "comment" (
        "id" serial PRIMARY KEY,
        "text" text,
        "created_at" timestamp with time zone DEFAULT NOW(),
        "userId" integer,
        "postId" integer
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "comment"
      ADD CONSTRAINT "FK_User"
      FOREIGN KEY ("userId")
      REFERENCES "user"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "comment"
      ADD CONSTRAINT "FK_Post"
      FOREIGN KEY ("postId")
      REFERENCES "post"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "comment"
      DROP CONSTRAINT "FK_User"
    `);

    await queryRunner.query(`
      ALTER TABLE "comment"
      DROP CONSTRAINT "FK_Post"
    `);

    await queryRunner.query(`DROP TABLE "comment"`);
  }
}
