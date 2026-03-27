import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateNotificationsTable1734490000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'notifications',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    {
                        name: 'userId',
                        type: 'varchar',
                        length: '36',
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['NEW_ANNOUNCEMENT', 'NEW_RESPONSE', 'OFFER_ACCEPTED', 'NEW_MESSAGE', 'OFFER_RECEIVED'],
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'message',
                        type: 'text',
                    },
                    {
                        name: 'link',
                        type: 'varchar',
                        length: '500',
                        isNullable: true,
                    },
                    {
                        name: 'relatedId',
                        type: 'varchar',
                        length: '36',
                        isNullable: true,
                    },
                    {
                        name: 'isRead',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        await queryRunner.createForeignKey(
            'notifications',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );

        
        await queryRunner.query(`
            CREATE INDEX idx_notifications_user_read 
            ON notifications (userId, isRead, createdAt DESC)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('notifications');
    }
}
