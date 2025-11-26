import { AppDataSource } from '@config/database';
import { Message } from '@entities/message.entity';

export class MessageRepository {
    private repository = AppDataSource.getRepository(Message);

    async findByConversation(
        conversationId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<Message[]> {
        return this.repository.find({
            where: { conversationId },
            relations: ['sender'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async findById(id: string): Promise<Message | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['sender', 'conversation'],
        });
    }

    async create(data: {
        conversationId: string;
        senderId: string;
        content: string;
    }): Promise<Message> {
        const message = this.repository.create(data);
        const savedMessage = await this.repository.save(message);

        return this.findById(savedMessage.id) as Promise<Message>;
    }

    async markAsRead(messageId: string, userId: string): Promise<void> {
        const message = await this.findById(messageId);
        if (!message) return;

        const readBy = message.readBy || [];
        if (!readBy.includes(userId)) {
            readBy.push(userId);
            await this.repository.update(messageId, { readBy });
        }
    }

    async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
        const messages = await this.repository.find({
            where: { conversationId },
        });

        for (const message of messages) {
            if (message.senderId !== userId) {
                await this.markAsRead(message.id, userId);
            }
        }
    }

    async getUnreadCount(conversationId: string, userId: string): Promise<number> {
        const messages = await this.repository
            .createQueryBuilder('message')
            .where('message.conversationId = :conversationId', { conversationId })
            .andWhere('message.senderId != :userId', { userId })
            .getMany();

        let unreadCount = 0;
        for (const message of messages) {
            const readBy = message.readBy || [];
            if (!readBy.includes(userId)) {
                unreadCount++;
            }
        }

        return unreadCount;
    }

    async getLastMessage(conversationId: string): Promise<Message | null> {
        return this.repository.findOne({
            where: { conversationId },
            relations: ['sender'],
            order: { createdAt: 'DESC' },
        });
    }
}
