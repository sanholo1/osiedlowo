import { NotificationRepository } from '../repositories/notification.repository';
import { NeighborhoodRepository } from '../repositories/neighborhood.repository';
import { Notification, NotificationType } from '../entities/notification.entity';
import { AppDataSource } from '@config/database';
import { User } from '../entities/user.entity';

export class NotificationService {
    private notificationRepository: NotificationRepository;
    private neighborhoodRepository: NeighborhoodRepository;

    constructor() {
        this.notificationRepository = new NotificationRepository();
        this.neighborhoodRepository = new NeighborhoodRepository();
    }

    async getUserNotifications(userId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
        return this.notificationRepository.findByUser(userId, limit, offset);
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.notificationRepository.getUnreadCount(userId);
    }

    async markAsRead(notificationId: string, userId: string): Promise<Notification | null> {
        return this.notificationRepository.markAsRead(notificationId, userId);
    }

    async markAllAsRead(userId: string): Promise<void> {
        return this.notificationRepository.markAllAsRead(userId);
    }


    async notifyNewAnnouncement(
        neighborhoodId: string,
        announcementId: string,
        authorId: string,
        authorName: string,
        title: string
    ): Promise<void> {

        const neighborhood = await this.neighborhoodRepository.findById(neighborhoodId);
        if (!neighborhood || !neighborhood.members) return;

        const notifications = neighborhood.members
            .filter(member => member.id !== authorId)
            .map(member => ({
                userId: member.id,
                type: NotificationType.NEW_ANNOUNCEMENT,
                title: 'Nowe ogłoszenie',
                message: `${authorName} dodał(a) nowe ogłoszenie: "${title}"`,
                link: `/group?id=${neighborhoodId}`,
                relatedId: announcementId,
            }));

        if (notifications.length > 0) {
            await this.notificationRepository.createMany(notifications);
        }
    }

    async notifyNewResponse(
        authorId: string,
        responderId: string,
        responderName: string,
        announcementTitle: string,
        announcementId: string,
        neighborhoodId: string
    ): Promise<void> {
        await this.notificationRepository.create({
            userId: authorId,
            type: NotificationType.NEW_RESPONSE,
            title: 'Nowa odpowiedź na ogłoszenie',
            message: `${responderName} zgłosił(a) się do: "${announcementTitle}"`,
            link: `/group?id=${neighborhoodId}`,
            relatedId: announcementId,
        });
    }

    async notifyOfferAccepted(
        responderId: string,
        authorName: string,
        announcementTitle: string,
        announcementId: string,
        neighborhoodId: string
    ): Promise<void> {
        await this.notificationRepository.create({
            userId: responderId,
            type: NotificationType.OFFER_ACCEPTED,
            title: 'Twoja oferta została zaakceptowana!',
            message: `${authorName} zaakceptował(a) Twoją ofertę pomocy w: "${announcementTitle}"`,
            link: `/group?id=${neighborhoodId}`,
            relatedId: announcementId,
        });
    }

    async notifyNewMessage(
        recipientId: string,
        senderName: string,
        conversationId: string
    ): Promise<void> {
        await this.notificationRepository.create({
            userId: recipientId,
            type: NotificationType.NEW_MESSAGE,
            title: 'Nowa wiadomość',
            message: `${senderName} wysłał(a) Ci wiadomość`,
            link: `/messages`,
            relatedId: conversationId,
        });
    }

    async notifySystemAnnouncement(
        announcementId: string,
        title: string,
        content: string
    ): Promise<void> {
        const userRepository = AppDataSource.getRepository(User);
        const activeUsers = await userRepository.find({
            where: { isActive: true },
            select: ['id']
        });

        const notifications = activeUsers.map(user => ({
            userId: user.id,
            type: NotificationType.SYSTEM_ANNOUNCEMENT,
            title: 'Ogłoszenie systemowe',
            message: title,
            link: null,
            relatedId: announcementId,
        }));

        if (notifications.length > 0) {
            await this.notificationRepository.createMany(notifications);
        }
    }

    async deleteSystemAnnouncementNotifications(announcementId: string): Promise<void> {
        await this.notificationRepository.deleteByRelatedId(announcementId);
    }
}
