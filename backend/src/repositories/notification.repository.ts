import { AppDataSource } from '@config/database';
import { Notification, NotificationType } from '../entities/notification.entity';

export class NotificationRepository {
    private repository = AppDataSource.getRepository(Notification);

    async create(data: Partial<Notification>): Promise<Notification> {
        const notification = this.repository.create(data);
        return this.repository.save(notification);
    }

    async createMany(notifications: Partial<Notification>[]): Promise<Notification[]> {
        const entities = notifications.map(n => this.repository.create(n));
        return this.repository.save(entities);
    }

    async findByUser(userId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
        return this.repository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async findUnreadByUser(userId: string): Promise<Notification[]> {
        return this.repository.find({
            where: { userId, isRead: false },
            order: { createdAt: 'DESC' },
        });
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.repository.count({
            where: { userId, isRead: false },
        });
    }

    async markAsRead(id: string, userId: string): Promise<Notification | null> {
        await this.repository.update(
            { id, userId },
            { isRead: true }
        );
        return this.repository.findOne({ where: { id, userId } });
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.repository.update(
            { userId, isRead: false },
            { isRead: true }
        );
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const result = await this.repository.delete({ id, userId });
        return result.affected !== 0;
    }

    async deleteOldNotifications(olderThanDays: number = 30): Promise<void> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        await this.repository
            .createQueryBuilder()
            .delete()
            .where('createdAt < :cutoffDate', { cutoffDate })
            .andWhere('isRead = :isRead', { isRead: true })
            .execute();
    }
}
