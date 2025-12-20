import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsPinnedToAnnouncements1734520000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'announcements',
            new TableColumn({
                name: 'isPinned',
                type: 'boolean',
                default: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('announcements', 'isPinned');
    }
}
