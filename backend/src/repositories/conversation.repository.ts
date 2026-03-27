import { AppDataSource } from '../config/database';
import { Conversation, ConversationType } from '../entities/conversation.entity';
import { ConversationParticipant } from '../entities/conversation-participant.entity';
import { User } from '../entities/user.entity';
import { In } from 'typeorm';

export class ConversationRepository {
    private repository = AppDataSource.getRepository(Conversation);
    private participantRepository = AppDataSource.getRepository(ConversationParticipant);

    async findByUser(userId: string): Promise<Conversation[]> {
        return this.repository
            .createQueryBuilder('conversation')
            .innerJoin('conversation.participants', 'participant')
            .where('participant.userId = :userId', { userId })
            .leftJoinAndSelect('conversation.participants', 'allParticipants')
            .leftJoinAndSelect('allParticipants.user', 'user')
            .leftJoinAndSelect('conversation.messages', 'message')
            .orderBy('conversation.updatedAt', 'DESC')
            .addOrderBy('message.createdAt', 'DESC')
            .getMany();
    }

    async findById(id: string, userId?: string): Promise<Conversation | null> {
        const query = this.repository
            .createQueryBuilder('conversation')
            .where('conversation.id = :id', { id })
            .leftJoinAndSelect('conversation.participants', 'participants')
            .leftJoinAndSelect('participants.user', 'user')
            .leftJoinAndSelect('conversation.messages', 'messages')
            .leftJoinAndSelect('messages.sender', 'sender');

        if (userId) {
            query.innerJoin(
                'conversation.participants',
                'userParticipant',
                'userParticipant.userId = :userId',
                { userId }
            );
        }

        return query.getOne();
    }

    async findPrivateConversation(user1Id: string, user2Id: string): Promise<Conversation | null> {
        const conversations = await this.repository
            .createQueryBuilder('conversation')
            .innerJoin('conversation.participants', 'p1', 'p1.userId = :user1Id', { user1Id })
            .innerJoin('conversation.participants', 'p2', 'p2.userId = :user2Id', { user2Id })
            .where('conversation.type = :type', { type: ConversationType.PRIVATE })
            .leftJoinAndSelect('conversation.participants', 'allParticipants')
            .leftJoinAndSelect('allParticipants.user', 'user')
            .getMany();

        const exactMatch = conversations.find(conv => conv.participants.length === 2);
        return exactMatch || null;
    }

    async findByNeighborhoodId(neighborhoodId: string): Promise<Conversation | null> {
        return this.repository.findOne({
            where: { neighborhoodId },
        });
    }

    async create(data: {
        type: ConversationType;
        name?: string;
        neighborhoodId?: string;
        participantIds: string[];
    }): Promise<Conversation> {
        const conversation = this.repository.create({
            type: data.type,
            name: data.name,
            neighborhoodId: data.neighborhoodId,
        });

        const savedConversation = await this.repository.save(conversation);

        for (const userId of data.participantIds) {
            await this.addParticipant(savedConversation.id, userId);
        }

        const result = await this.findById(savedConversation.id);
        return result!;
    }

    async addParticipant(conversationId: string, userId: string): Promise<ConversationParticipant> {
        const participant = this.participantRepository.create({
            conversationId,
            userId,
        });

        return this.participantRepository.save(participant);
    }

    async removeParticipant(conversationId: string, userId: string): Promise<void> {
        await this.participantRepository.delete({
            conversationId,
            userId,
        });
    }

    async isParticipant(conversationId: string, userId: string): Promise<boolean> {
        const count = await this.participantRepository.count({
            where: {
                conversationId,
                userId,
            },
        });

        return count > 0;
    }

    async updateLastRead(conversationId: string, userId: string): Promise<void> {
        await this.participantRepository
            .createQueryBuilder()
            .update(ConversationParticipant)
            .set({ lastReadAt: new Date() })
            .where('conversationId = :conversationId', { conversationId })
            .andWhere('userId = :userId', { userId })
            .execute();
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async findAllGroups(): Promise<Conversation[]> {
        return this.repository
            .createQueryBuilder('conversation')
            .where('conversation.type = :type', { type: ConversationType.GROUP })
            .leftJoinAndSelect('conversation.participants', 'participants')
            .leftJoinAndSelect('participants.user', 'user')
            .orderBy('conversation.updatedAt', 'DESC')
            .getMany();
    }
}
