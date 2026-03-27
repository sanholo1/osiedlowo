import { Request, Response, NextFunction } from 'express';
import { ChatService } from '@services/chat.service';
import { CreateConversationDto } from '@dtos/create-conversation.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class ChatController {
    private chatService: ChatService;

    constructor() {
        this.chatService = new ChatService();
    }

    createConversation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.userId;
            const dto = plainToInstance(CreateConversationDto, req.body);

            const errors = await validate(dto);
            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            let conversation;

            if (dto.type === 'private') {
                if (dto.participantIds.length !== 1) {
                    return res.status(400).json({
                        message: 'Czat prywatny wymaga dokładnie jednego drugiego uczestnika'
                    });
                }
                conversation = await this.chatService.getOrCreatePrivateConversation(
                    userId,
                    dto.participantIds[0]
                );
            } else {
                // Group conversation
                const allParticipants = [userId, ...dto.participantIds];
                conversation = await this.chatService.createGroupConversation(
                    dto.name || 'Grupa',
                    allParticipants,
                    dto.neighborhoodId
                );
            }

            res.status(201).json(conversation);
        } catch (error) {
            next(error);
        }
    };

    getUserConversations = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.userId;
            const conversations = await this.chatService.getUserConversations(userId);
            res.json(conversations);
        } catch (error) {
            next(error);
        }
    };

    getConversationMessages = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;

            const messages = await this.chatService.getConversationMessages(
                id,
                userId,
                limit,
                offset
            );

            res.json(messages);
        } catch (error) {
            next(error);
        }
    };

    markAsRead = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;

            await this.chatService.markMessagesAsRead(id, userId);
            res.json({ message: 'Oznaczono jako przeczytane' });
        } catch (error) {
            next(error);
        }
    };

    searchUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.userId;
            const query = req.query.q as string;

            if (!query || query.length < 2) {
                return res.status(400).json({ message: 'Zapytanie musi mieć co najmniej 2 znaki' });
            }

            const users = await this.chatService.searchUsersByName(query, userId);

            // Remove password from response
            const sanitizedUsers = users.map(user => user.toJSON());

            res.json(sanitizedUsers);
        } catch (error) {
            next(error);
        }
    };
}
