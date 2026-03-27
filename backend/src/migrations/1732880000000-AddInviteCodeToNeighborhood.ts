import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddInviteCodeToNeighborhood1732880000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("neighborhoods", new TableColumn({
            name: "inviteCode",
            type: "varchar",
            length: "10",
            isNullable: true
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("neighborhoods", "inviteCode");
    }

}
