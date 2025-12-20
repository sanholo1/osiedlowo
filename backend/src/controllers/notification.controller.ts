import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class NotificationController {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    getNotifications = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user!.userId;
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;

            const notifications = await this.notificationService.getUserNotifications(userId, limit, offset);
            res.json(notifications);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user!.userId;
            const count = await this.notificationService.getUnreadCount(userId);
            res.json({ count });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    markAsRead = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;

            const notification = await this.notificationService.markAsRead(id, userId);
            if (!notification) {
                return res.status(404).json({ message: 'Powiadomienie nie zostało znalezione' });
            }

            res.json(notification);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user!.userId;
            await this.notificationService.markAllAsRead(userId);
            res.json({ message: 'Wszystkie powiadomienia oznaczone jako przeczytane' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };
}
