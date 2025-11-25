export class MessageResponseDto {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    readBy: string[];
    sender: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
