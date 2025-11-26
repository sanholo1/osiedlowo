import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateChatTables1732476000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "conversations",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: ["private", "group"],
                        default: "'private'",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "neighborhoodId",
                        type: "varchar",
                        length: "36",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        await queryRunner.createTable(
            new Table({
                name: "messages",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "conversationId",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "senderId",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "content",
                        type: "text",
                    },
                    {
                        name: "readBy",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        await queryRunner.createTable(
            new Table({
                name: "conversation_participants",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "conversationId",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "userId",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "lastReadAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "joinedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        await queryRunner.query(
            `ALTER TABLE users ADD COLUMN username VARCHAR(255) NULL UNIQUE AFTER email`
        );

        await queryRunner.createForeignKey(
            "messages",
            new TableForeignKey({
                columnNames: ["conversationId"],
                referencedColumnNames: ["id"],
                referencedTableName: "conversations",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "messages",
            new TableForeignKey({
                columnNames: ["senderId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "conversation_participants",
            new TableForeignKey({
                columnNames: ["conversationId"],
                referencedColumnNames: ["id"],
                referencedTableName: "conversations",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "conversation_participants",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.query(
            `CREATE INDEX idx_messages_conversation_id ON messages(conversationId)`
        );
        await queryRunner.query(
            `CREATE INDEX idx_messages_sender_id ON messages(senderId)`
        );
        await queryRunner.query(
            `CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversationId)`
        );
        await queryRunner.query(
            `CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(userId)`
        );
        await queryRunner.query(
            `CREATE INDEX idx_users_username ON users(username)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX idx_users_username ON users`);
        await queryRunner.query(`DROP INDEX idx_conversation_participants_user_id ON conversation_participants`);
        await queryRunner.query(`DROP INDEX idx_conversation_participants_conversation_id ON conversation_participants`);
        await queryRunner.query(`DROP INDEX idx_messages_sender_id ON messages`);
        await queryRunner.query(`DROP INDEX idx_messages_conversation_id ON messages`);

        const messagesTable = await queryRunner.getTable("messages");
        const conversationParticipantsTable = await queryRunner.getTable("conversation_participants");

        if (messagesTable) {
            const messageForeignKeys = messagesTable.foreignKeys;
            for (const foreignKey of messageForeignKeys) {
                await queryRunner.dropForeignKey("messages", foreignKey);
            }
        }

        if (conversationParticipantsTable) {
            const participantForeignKeys = conversationParticipantsTable.foreignKeys;
            for (const foreignKey of participantForeignKeys) {
                await queryRunner.dropForeignKey("conversation_participants", foreignKey);
            }
        }

        await queryRunner.dropTable("conversation_participants");
        await queryRunner.dropTable("messages");
        await queryRunner.dropTable("conversations");

        await queryRunner.query(`ALTER TABLE users DROP COLUMN username`);
    }
}
