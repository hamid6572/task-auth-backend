import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1634844817394 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" serial PRIMARY KEY,
        "name" character varying(255),
        "email" character varying(255),
        "password" character varying(255),
        "created_at" timestamp with time zone DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
