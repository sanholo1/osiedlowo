import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRatingsTable1734500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'ratings',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                    },
                    {
                        name: 'fromUserId',
                        type: 'varchar',
                        length: '36',
                    },
                    {
                        name: 'toUserId',
                        type: 'varchar',
                        length: '36',
                    },
                    {
                        name: 'announcementId',
                        type: 'varchar',
                        length: '36',
                    },
                    {
                        name: 'stars',
                        type: 'int',
                    },
                    {
                        name: 'comment',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        
        await queryRunner.createForeignKey(
            'ratings',
            new TableForeignKey({
                columnNames: ['fromUserId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'ratings',
            new TableForeignKey({
                columnNames: ['toUserId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'ratings',
            new TableForeignKey({
                columnNames: ['announcementId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'announcements',
                onDelete: 'CASCADE',
            }),
        );

        
        await queryRunner.query(
            'CREATE INDEX idx_ratings_toUserId ON ratings(toUserId)',
        );
        await queryRunner.query(
            'CREATE UNIQUE INDEX idx_ratings_unique ON ratings(fromUserId, toUserId, announcementId)',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('ratings');
    }
}
