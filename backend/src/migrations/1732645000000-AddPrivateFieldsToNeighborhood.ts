import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPrivateFieldsToNeighborhood1732645000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'neighborhoods',
            new TableColumn({
                name: 'isPrivate',
                type: 'boolean',
                default: false,
            })
        );

        await queryRunner.addColumn(
            'neighborhoods',
            new TableColumn({
                name: 'password',
                type: 'varchar',
                length: '255',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('neighborhoods', 'password');
        await queryRunner.dropColumn('neighborhoods', 'isPrivate');
    }
}
