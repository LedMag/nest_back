import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1673393157715 implements MigrationInterface {
    name = 'migration1673393157715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_22cc43e9a74d7498546e9a63e7\` ON \`product\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`name\` varchar(32) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD UNIQUE INDEX \`IDX_22cc43e9a74d7498546e9a63e7\` (\`name\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product\` DROP INDEX \`IDX_22cc43e9a74d7498546e9a63e7\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`name\` varchar(64) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_22cc43e9a74d7498546e9a63e7\` ON \`product\` (\`name\`)`);
    }

}
