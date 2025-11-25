import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateNeighborhoodTables1732560000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tworzenie tabeli neighborhoods
        await queryRunner.createTable(
            new Table({
                name: 'neighborhoods',
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
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'city',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'adminId', // Zmieniono na camelCase
                        type: 'varchar',
                        length: '36',
                        isNullable: true, // Zmieniono na nullable
                    },
                    {
                        name: 'createdAt', // Zmieniono na camelCase
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt', // Zmieniono na camelCase
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Tworzenie tabeli neighborhood_members (relacja many-to-many)
        await queryRunner.createTable(
            new Table({
                name: 'neighborhood_members',
                columns: [
                    {
                        name: 'neighborhood_id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'user_id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                ],
            }),
            true
        );

        // Klucze obce dla neighborhoods
        await queryRunner.createForeignKey(
            'neighborhoods',
            new TableForeignKey({
                columnNames: ['adminId'], // Zmieniono na camelCase
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );

        // Klucze obce dla neighborhood_members
        await queryRunner.createForeignKey(
            'neighborhood_members',
            new TableForeignKey({
                columnNames: ['neighborhood_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'neighborhoods',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'neighborhood_members',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );

        // Dodanie klucza obcego do tabeli conversations (kolumna neighborhoodId już istnieje)
        const table = await queryRunner.getTable('conversations');
        const column = table?.findColumnByName('neighborhoodId');

        if (column) {
            // Sprawdzamy czy FK już istnieje
            const fkExists = table?.foreignKeys.find(fk => fk.columnNames.indexOf('neighborhoodId') !== -1);

            if (!fkExists) {
                await queryRunner.createForeignKey(
                    'conversations',
                    new TableForeignKey({
                        columnNames: ['neighborhoodId'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'neighborhoods',
                        onDelete: 'CASCADE',
                    })
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Usunięcie klucza obcego z conversations
        const conversationsTable = await queryRunner.getTable('conversations');
        const neighborhoodFk = conversationsTable?.foreignKeys.find(
            fk => fk.columnNames.indexOf('neighborhoodId') !== -1
        );
        if (neighborhoodFk) {
            await queryRunner.dropForeignKey('conversations', neighborhoodFk);
        }

        // Nie usuwamy kolumny neighborhoodId, bo została utworzona w innej migracji

        // Usunięcie kluczy obcych z neighborhood_members
        const neighborhoodMembersTable = await queryRunner.getTable('neighborhood_members');
        if (neighborhoodMembersTable) {
            for (const foreignKey of neighborhoodMembersTable.foreignKeys) {
                await queryRunner.dropForeignKey('neighborhood_members', foreignKey);
            }
        }

        // Usunięcie kluczy obcych z neighborhoods
        const neighborhoodsTable = await queryRunner.getTable('neighborhoods');
        if (neighborhoodsTable) {
            for (const foreignKey of neighborhoodsTable.foreignKeys) {
                await queryRunner.dropForeignKey('neighborhoods', foreignKey);
            }
        }

        // Usunięcie tabel
        await queryRunner.dropTable('neighborhood_members');
        await queryRunner.dropTable('neighborhoods');
    }
}
