import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class AddExtendedAdminFeatures1736293000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add lastLoginAt to users table
        await queryRunner.addColumn('users', new TableColumn({
            name: 'lastLoginAt',
            type: 'datetime',
            isNullable: true
        }));

        // Add isFlagged and flagReason to announcements table
        await queryRunner.addColumn('announcements', new TableColumn({
            name: 'isFlagged',
            type: 'boolean',
            default: false
        }));

        await queryRunner.addColumn('announcements', new TableColumn({
            name: 'flagReason',
            type: 'varchar',
            length: '255',
            isNullable: true
        }));

        // Create admin_logs table
        await queryRunner.createTable(new Table({
            name: 'admin_logs',
            columns: [
                {
                    name: 'id',
                    type: 'varchar',
                    length: '36',
                    isPrimary: true,
                    generationStrategy: 'uuid'
                },
                {
                    name: 'action',
                    type: 'enum',
                    enum: [
                        'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_BLOCKED', 'USER_UNBLOCKED', 'USER_ROLE_CHANGED',
                        'ANNOUNCEMENT_CREATED', 'ANNOUNCEMENT_UPDATED', 'ANNOUNCEMENT_DELETED', 'ANNOUNCEMENT_PINNED', 'ANNOUNCEMENT_UNPINNED', 'ANNOUNCEMENT_FLAGGED', 'ANNOUNCEMENT_UNFLAGGED',
                        'RATING_DELETED',
                        'NEIGHBORHOOD_UPDATED', 'NEIGHBORHOOD_DELETED', 'NEIGHBORHOOD_MEMBER_REMOVED',
                        'MESSAGE_DELETED',
                        'SYSTEM_ANNOUNCEMENT_CREATED', 'SYSTEM_ANNOUNCEMENT_UPDATED', 'SYSTEM_ANNOUNCEMENT_DELETED'
                    ]
                },
                {
                    name: 'adminId',
                    type: 'varchar',
                    length: '36'
                },
                {
                    name: 'targetType',
                    type: 'enum',
                    enum: ['user', 'announcement', 'rating', 'neighborhood', 'message', 'system_announcement']
                },
                {
                    name: 'targetId',
                    type: 'varchar',
                    length: '36',
                    isNullable: true
                },
                {
                    name: 'details',
                    type: 'json',
                    isNullable: true
                },
                {
                    name: 'ipAddress',
                    type: 'varchar',
                    length: '45',
                    isNullable: true
                },
                {
                    name: 'createdAt',
                    type: 'datetime',
                    default: 'CURRENT_TIMESTAMP'
                }
            ]
        }), true);

        await queryRunner.createForeignKey('admin_logs', new TableForeignKey({
            columnNames: ['adminId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
        }));

        // Create system_announcements table
        await queryRunner.createTable(new Table({
            name: 'system_announcements',
            columns: [
                {
                    name: 'id',
                    type: 'varchar',
                    length: '36',
                    isPrimary: true,
                    generationStrategy: 'uuid'
                },
                {
                    name: 'title',
                    type: 'varchar',
                    length: '255'
                },
                {
                    name: 'content',
                    type: 'text'
                },
                {
                    name: 'priority',
                    type: 'enum',
                    enum: ['low', 'medium', 'high', 'critical'],
                    default: "'medium'"
                },
                {
                    name: 'isActive',
                    type: 'boolean',
                    default: true
                },
                {
                    name: 'expiresAt',
                    type: 'datetime',
                    isNullable: true
                },
                {
                    name: 'createdById',
                    type: 'varchar',
                    length: '36'
                },
                {
                    name: 'createdAt',
                    type: 'datetime',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'updatedAt',
                    type: 'datetime',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP'
                }
            ]
        }), true);

        await queryRunner.createForeignKey('system_announcements', new TableForeignKey({
            columnNames: ['createdById'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('system_announcements');
        await queryRunner.dropTable('admin_logs');
        await queryRunner.dropColumn('announcements', 'flagReason');
        await queryRunner.dropColumn('announcements', 'isFlagged');
        await queryRunner.dropColumn('users', 'lastLoginAt');
    }
}
