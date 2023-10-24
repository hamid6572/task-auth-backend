import { MigrationInterface, QueryRunner } from "typeorm";

export class AddsNestedRepliesToComments1697632321491 implements MigrationInterface {
    name = 'AddsNestedRepliesToComments1697632321491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ADD "parentId" integer`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_e3aebe2bd1c53467a07109be596" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_e3aebe2bd1c53467a07109be596"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "parentId"`);
    }

}
