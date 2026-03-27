import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { appConfig } from '@config/app.config';
import { ChatService } from '@services/chat.service';
import { SendMessageDto } from '@dtos/send-message.dto';

interface AuthenticatedSocket extends Socket {
    userId?: string;
}

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: appConfig.corsOrigin,
            credentials: true,
        },
    });

    const chatService = new ChatService();

    io.use((socket: AuthenticatedSocket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = jwt.verify(token, appConfig.jwt.secret) as any;
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
        const userId = socket.userId!;


        socket.join(`user:${userId}`);

        socket.on('join_conversation', async (data: { conversationId: string }) => {
            try {
                const { conversationId } = data;

                const isParticipant = await chatService['conversationRepository'].isParticipant(conversationId, userId);
                if (!isParticipant) {
                    socket.emit('error', { message: 'Nie masz dostępu do tej konwersacji' });
                    return;
                }

                socket.join(`conversation:${conversationId}`);


                socket.emit('joined_conversation', { conversationId });
            } catch (error) {
                console.error('Error joining conversation:', error);
                socket.emit('error', { message: 'Błąd dołączania do konwersacji' });
            }
        });

        socket.on('send_message', async (data: { conversationId: string; content: string }) => {
            try {
                const { conversationId, content } = data;

                if (!content || content.trim().length === 0) {
                    socket.emit('error', { message: 'Wiadomość nie może być pusta' });
                    return;
                }

                if (content.length > 5000) {
                    socket.emit('error', { message: 'Wiadomość jest zbyt długa (max 5000 znaków)' });
                    return;
                }

                const message = await chatService.sendMessage(conversationId, userId, content);

                io.to(`conversation:${conversationId}`).emit('new_message', {
                    id: message.id,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    content: message.content,
                    sender: message.sender,
                    readBy: message.readBy || [],
                    createdAt: message.createdAt,
                    updatedAt: message.updatedAt,
                });


            } catch (error: any) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: error.message || 'Błąd wysyłania wiadomości' });
            }
        });

        socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
            try {
                const { conversationId, isTyping } = data;

                socket.to(`conversation:${conversationId}`).emit('user_typing', {
                    conversationId,
                    userId,
                    isTyping,
                });
            } catch (error) {
                console.error('Error handling typing event:', error);
            }
        });

        socket.on('mark_read', async (data: { conversationId: string }) => {
            try {
                const { conversationId } = data;

                await chatService.markMessagesAsRead(conversationId, userId);

                socket.to(`conversation:${conversationId}`).emit('messages_read', {
                    conversationId,
                    userId,
                });
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        });

        socket.on('delete_message', async (data: { messageId: string }) => {
            try {
                const { messageId } = data;

                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
                const decoded = jwt.verify(token, appConfig.jwt.secret) as any;
                const userRole = decoded.role || 'user';

                const result = await chatService.deleteMessage(messageId, userId, userRole);

                io.to(`conversation:${result.conversationId}`).emit('message_deleted', {
                    messageId,
                    conversationId: result.conversationId,
                    deletedBy: userId,
                });


            } catch (error: any) {
                console.error('Error deleting message:', error);
                socket.emit('error', { message: error.message || 'Błąd usuwania wiadomości' });
            }
        });

        socket.on('disconnect', () => {

        });
    });



    return io;
};
