import { MigrationInterface, QueryRunner, TableColumn, Table, TableForeignKey } from 'typeorm';

export class AddAnnouncementEnhancements1734480000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(`
            ALTER TABLE announcements 
            MODIFY COLUMN status ENUM('ACTIVE', 'IN_PROGRESS', 'RESOLVED', 'EXPIRED') 
            DEFAULT 'ACTIVE'
        `);

        
        await queryRunner.addColumn(
            'announcements',
            new TableColumn({
                name: 'viewCount',
                type: 'int',
                default: 0,
            })
        );

        
        await queryRunner.addColumn(
            'announcements',
            new TableColumn({
                name: 'acceptedResponseId',
                type: 'varchar',
                length: '36',
                isNullable: true,
            })
        );

        
        await queryRunner.addColumn(
            'announcement_responses',
            new TableColumn({
                name: 'isAccepted',
                type: 'boolean',
                default: false,
            })
        );

        
        await queryRunner.createTable(
            new Table({
                name: 'announcement_views',
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
                        name: 'announcementId',
                        type: 'varchar',
                        length: '36',
                    },
                    {
                        name: 'userId',
                        type: 'varchar',
                        length: '36',
                    },
                    {
                        name: 'viewedAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        
        await queryRunner.query(`
            ALTER TABLE announcement_views 
            ADD UNIQUE INDEX unique_user_announcement (userId, announcementId)
        `);

        
        await queryRunner.createForeignKey(
            'announcement_views',
            new TableForeignKey({
                columnNames: ['announcementId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'announcements',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'announcement_views',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('announcement_views');
        await queryRunner.dropColumn('announcement_responses', 'isAccepted');
        await queryRunner.dropColumn('announcements', 'acceptedResponseId');
        await queryRunner.dropColumn('announcements', 'viewCount');

        await queryRunner.query(`
            ALTER TABLE announcements 
            MODIFY COLUMN status ENUM('ACTIVE', 'RESOLVED', 'EXPIRED') 
            DEFAULT 'ACTIVE'
        `);
    }
}
