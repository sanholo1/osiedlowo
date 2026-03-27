import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAddressToUser1732641000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'address',
                type: 'varchar',
                length: '200',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'address');
    }
}
