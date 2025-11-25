export class ConversationResponseDto {
    id: string;
    type: string;
    name?: string;
    neighborhoodId?: string;
    participants: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
    }[];
    lastMessage?: {
        id: string;
        content: string;
        senderId: string;
        createdAt: Date;
    };
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}
