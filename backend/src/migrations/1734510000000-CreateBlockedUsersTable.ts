import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBlockedUsersTable1734510000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'blocked_users',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                    },
                    {
                        name: 'userId',
                        type: 'varchar',
                        length: '36',
                    },
                    {
                        name: 'blockedUserId',
                        type: 'varchar',
                        length: '36',
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        
        await queryRunner.createForeignKey(
            'blocked_users',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'blocked_users',
            new TableForeignKey({
                columnNames: ['blockedUserId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        
        await queryRunner.query(
            'CREATE UNIQUE INDEX idx_blocked_users_unique ON blocked_users(userId, blockedUserId)',
        );

        
        await queryRunner.query(
            'CREATE INDEX idx_blocked_users_userId ON blocked_users(userId)',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('blocked_users');
    }
}
