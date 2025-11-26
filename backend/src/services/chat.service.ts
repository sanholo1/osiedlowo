import { ConversationRepository } from '@repositories/conversation.repository';
import { MessageRepository } from '@repositories/message.repository';
import { UserRepository } from '@repositories/user.repository';
import { ConversationType } from '@entities/conversation.entity';
import { Conversation } from '@entities/conversation.entity';
import { Message } from '@entities/message.entity';
import { User } from '@entities/user.entity';
import {
    NotFoundException,
    BadRequestException,
    ForbiddenException
} from '@exceptions';
import { ConversationResponseDto } from '@dtos/conversation-response.dto';
import { MessageResponseDto } from '@dtos/message-response.dto';

export class ChatService {
    private conversationRepository: ConversationRepository;
    private messageRepository: MessageRepository;
    private userRepository: UserRepository;

    constructor() {
        this.conversationRepository = new ConversationRepository();
        this.messageRepository = new MessageRepository();
        this.userRepository = new UserRepository();
    }

    async getOrCreatePrivateConversation(user1Id: string, user2Id: string): Promise<Conversation> {
        const existing = await this.conversationRepository.findPrivateConversation(user1Id, user2Id);
        if (existing) {
            return existing;
        }

        const user2 = await this.userRepository.findById(user2Id);
        if (!user2) {
            throw new NotFoundException('Użytkownik nie został znaleziony');
        }

        return this.conversationRepository.create({
            type: ConversationType.PRIVATE,
            participantIds: [user1Id, user2Id],
        });
    }

    async createGroupConversation(
        name: string,
        userIds: string[],
        neighborhoodId?: string
    ): Promise<Conversation> {
        if (userIds.length < 2) {
            throw new BadRequestException('Czat grupowy wymaga co najmniej 2 uczestników');
        }

        return this.conversationRepository.create({
            type: ConversationType.GROUP,
            name,
            participantIds: userIds,
            neighborhoodId,
        });
    }

    async getUserConversations(userId: string): Promise<ConversationResponseDto[]> {
        const conversations = await this.conversationRepository.findByUser(userId);

        const conversationDtos: ConversationResponseDto[] = [];

        for (const conversation of conversations) {
            const lastMessage = await this.messageRepository.getLastMessage(conversation.id);
            const unreadCount = await this.messageRepository.getUnreadCount(conversation.id, userId);

            conversationDtos.push({
                id: conversation.id,
                type: conversation.type,
                name: conversation.name,
                neighborhoodId: conversation.neighborhoodId,
                participants: conversation.participants.map(p => ({
                    id: p.user.id,
                    username: p.user.username || p.user.email,
                    firstName: p.user.firstName || '',
                    lastName: p.user.lastName || '',
                })),
                lastMessage: lastMessage ? {
                    id: lastMessage.id,
                    content: lastMessage.content,
                    senderId: lastMessage.senderId,
                    createdAt: lastMessage.createdAt,
                } : undefined,
                unreadCount,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt,
            });
        }

        return conversationDtos;
    }

    async getConversationMessages(
        conversationId: string,
        userId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<MessageResponseDto[]> {
        const isParticipant = await this.conversationRepository.isParticipant(conversationId, userId);
        if (!isParticipant) {
            throw new ForbiddenException('Nie masz dostępu do tej konwersacji');
        }

        const messages = await this.messageRepository.findByConversation(conversationId, limit, offset);

        return messages.map(message => ({
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            content: message.content,
            readBy: message.readBy || [],
            sender: {
                id: message.sender.id,
                username: message.sender.username || message.sender.email,
                firstName: message.sender.firstName || '',
                lastName: message.sender.lastName || '',
            },
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
        }));
    }

    async sendMessage(
        conversationId: string,
        senderId: string,
        content: string
    ): Promise<Message> {
        const isParticipant = await this.conversationRepository.isParticipant(conversationId, senderId);
        if (!isParticipant) {
            throw new ForbiddenException('Nie masz dostępu do tej konwersacji');
        }

        const message = await this.messageRepository.create({
            conversationId,
            senderId,
            content,
        });

        await this.messageRepository.markAsRead(message.id, senderId);

        return message;
    }

    async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
        const isParticipant = await this.conversationRepository.isParticipant(conversationId, userId);
        if (!isParticipant) {
            throw new ForbiddenException('Nie masz dostępu do tej konwersacji');
        }

        await this.messageRepository.markConversationAsRead(conversationId, userId);
        await this.conversationRepository.updateLastRead(conversationId, userId);
    }

    async searchUsersByName(query: string, excludeUserId?: string): Promise<User[]> {
        const users = await this.userRepository.searchByName(query);

        if (excludeUserId) {
            return users.filter(user => user.id !== excludeUserId);
        }

        return users;
    }

    async addParticipant(conversationId: string, userId: string): Promise<void> {
        const isParticipant = await this.conversationRepository.isParticipant(conversationId, userId);
        if (isParticipant) {
            return;
        }
        await this.conversationRepository.addParticipant(conversationId, userId);
    }

    async removeParticipant(conversationId: string, userId: string): Promise<void> {
        await this.conversationRepository.removeParticipant(conversationId, userId);
    }

    async getConversationByNeighborhoodId(neighborhoodId: string): Promise<Conversation | null> {
        return this.conversationRepository.findByNeighborhoodId(neighborhoodId);
    }
}
