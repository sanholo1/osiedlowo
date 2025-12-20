import { ConversationRepository } from '@repositories/conversation.repository';
import { MessageRepository } from '@repositories/message.repository';
import { UserRepository } from '@repositories/user.repository';
import { NeighborhoodRepository } from '@repositories/neighborhood.repository';
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
    private neighborhoodRepository: NeighborhoodRepository;

    constructor() {
        this.conversationRepository = new ConversationRepository();
        this.messageRepository = new MessageRepository();
        this.userRepository = new UserRepository();
        this.neighborhoodRepository = new NeighborhoodRepository();
    }

    async getOrCreatePrivateConversation(user1Id: string, user2Id: string): Promise<ConversationResponseDto> {
        const existing = await this.conversationRepository.findPrivateConversation(user1Id, user2Id);

        if (!existing) {
            const user2 = await this.userRepository.findById(user2Id);
            if (!user2) {
                throw new NotFoundException('Użytkownik nie został znaleziony');
            }
        }

        const conversationToTransform = existing || await this.conversationRepository.create({
            type: ConversationType.PRIVATE,
            participantIds: [user1Id, user2Id],
        });

        
        return {
            id: conversationToTransform.id,
            type: conversationToTransform.type,
            name: conversationToTransform.name,
            neighborhoodId: conversationToTransform.neighborhoodId,
            participants: conversationToTransform.participants?.map(p => ({
                id: p.user?.id || p.userId,
                username: p.user?.username || p.user?.email || '',
                firstName: p.user?.firstName || '',
                lastName: p.user?.lastName || '',
            })) || [],
            updatedAt: conversationToTransform.updatedAt,
            createdAt: conversationToTransform.createdAt,
            unreadCount: 0,
        };
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
    async deleteConversation(conversationId: string, userId: string): Promise<void> {
        const isParticipant = await this.conversationRepository.isParticipant(conversationId, userId);
        if (!isParticipant) {
            throw new ForbiddenException('Nie masz dostępu do tej konwersacji');
        }

        await this.conversationRepository.delete(conversationId);
    }

    async deleteMessage(
        messageId: string,
        userId: string,
        userRole: string
    ): Promise<{ conversationId: string }> {
        const message = await this.messageRepository.findById(messageId);
        if (!message) {
            throw new NotFoundException('Wiadomość nie została znaleziona');
        }

        const conversation = await this.conversationRepository.findById(message.conversationId);
        if (!conversation) {
            throw new NotFoundException('Konwersacja nie została znaleziona');
        }

        const isSystemAdmin = userRole === 'admin';
        if (isSystemAdmin) {
            await this.messageRepository.delete(messageId);
            return { conversationId: message.conversationId };
        }

        if (conversation.neighborhoodId) {
            const neighborhood = await this.neighborhoodRepository.findById(conversation.neighborhoodId);
            if (neighborhood && neighborhood.adminId === userId) {
                await this.messageRepository.delete(messageId);
                return { conversationId: message.conversationId };
            }
        }

        throw new ForbiddenException('Nie masz uprawnień do usunięcia tej wiadomości');
    }

    async getTotalUnreadCount(userId: string): Promise<number> {
        const conversations = await this.conversationRepository.findByUser(userId);
        let total = 0;
        for (const conversation of conversations) {
            total += await this.messageRepository.getUnreadCount(conversation.id, userId);
        }
        return total;
    }
}
