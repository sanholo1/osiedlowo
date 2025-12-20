import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAnnouncementTables1734470000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.createTable(
            new Table({
                name: 'announcements',
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
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'content',
                        type: 'text',
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['HELP_REQUEST', 'HELP_OFFER', 'INFO', 'EVENT', 'LOST_FOUND'],
                        default: "'INFO'",
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['ACTIVE', 'RESOLVED', 'EXPIRED'],
                        default: "'ACTIVE'",
                    },
                    {
                        name: 'authorId',
                        type: 'varchar',
                        length: '36',
                    },
                    {
                        name: 'neighborhoodId',
                        type: 'varchar',
                        length: '36',
                    },
                    {
                        name: 'expiresAt',
                        type: 'datetime',
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
            true
        );

        
        await queryRunner.createTable(
            new Table({
                name: 'announcement_responses',
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
                        name: 'message',
                        type: 'text',
                        isNullable: true,
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
            'announcements',
            new TableForeignKey({
                columnNames: ['authorId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'announcements',
            new TableForeignKey({
                columnNames: ['neighborhoodId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'neighborhoods',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'announcement_responses',
            new TableForeignKey({
                columnNames: ['announcementId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'announcements',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'announcement_responses',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('announcement_responses');
        await queryRunner.dropTable('announcements');
    }
}
