import { AnnouncementRepository } from '../repositories/announcement.repository';
import { NeighborhoodRepository } from '../repositories/neighborhood.repository';
import { UserRepository } from '../repositories/user.repository';
import { Announcement, AnnouncementType, AnnouncementStatus } from '../entities/announcement.entity';
import { AnnouncementResponse } from '../entities/announcement-response.entity';
import { NotificationService } from './notification.service';
import { BlockedUserRepository } from '../repositories/blocked-user.repository';
import { ForbiddenException } from '../exceptions';

export class AnnouncementService {
    private announcementRepository: AnnouncementRepository;
    private neighborhoodRepository: NeighborhoodRepository;
    private userRepository: UserRepository;
    private notificationService: NotificationService;

    constructor() {
        this.announcementRepository = new AnnouncementRepository();
        this.neighborhoodRepository = new NeighborhoodRepository();
        this.userRepository = new UserRepository();
        this.notificationService = new NotificationService();
    }

    async createAnnouncement(data: {
        title: string;
        content: string;
        type: AnnouncementType;
        authorId: string;
        neighborhoodId: string;
        expiresAt?: Date;
    }): Promise<Announcement> {
        
        const isMember = await this.neighborhoodRepository.isMember(data.neighborhoodId, data.authorId);
        if (!isMember) {
            throw new ForbiddenException('Musisz być członkiem osiedla, aby dodać ogłoszenie');
        }

        const announcement = await this.announcementRepository.create({
            title: data.title,
            content: data.content,
            type: data.type,
            authorId: data.authorId,
            neighborhoodId: data.neighborhoodId,
            expiresAt: data.expiresAt || null,
            status: AnnouncementStatus.ACTIVE,
        });

        
        const author = await this.userRepository.findById(data.authorId);
        if (author) {
            const authorName = `${author.firstName} ${author.lastName}`;
            await this.notificationService.notifyNewAnnouncement(
                data.neighborhoodId,
                announcement.id,
                data.authorId,
                authorName,
                data.title
            );
        }

        return announcement;
    }

    async getAnnouncementById(id: string): Promise<Announcement | null> {
        return this.announcementRepository.findById(id);
    }

    async getAnnouncementsByNeighborhood(
        neighborhoodId: string,
        userId: string,
        options?: {
            type?: AnnouncementType;
            status?: AnnouncementStatus;
            authorId?: string;
        }
    ): Promise<Announcement[]> {
        
        const isMember = await this.neighborhoodRepository.isMember(neighborhoodId, userId);
        if (!isMember) {
            throw new ForbiddenException('Musisz być członkiem osiedla, aby zobaczyć ogłoszenia');
        }

        
        const queryBuilder = this.announcementRepository.getRepository()
            .createQueryBuilder('announcement')
            .where('announcement.neighborhoodId = :neighborhoodId', { neighborhoodId })
            .leftJoinAndSelect('announcement.author', 'author')
            .leftJoinAndSelect('announcement.neighborhood', 'neighborhood')
            .leftJoinAndSelect('announcement.responses', 'responses')
            .leftJoinAndSelect('responses.user', 'responseUser');

        if (options?.type) {
            queryBuilder.andWhere('announcement.type = :type', { type: options.type });
        }

        if (options?.status) {
            queryBuilder.andWhere('announcement.status = :status', { status: options.status });
        }

        if (options?.authorId) {
            queryBuilder.andWhere('announcement.authorId = :authorId', { authorId: options.authorId });
        }

        
        queryBuilder.orderBy('announcement.isPinned', 'DESC')
            .addOrderBy('announcement.createdAt', 'DESC');

        const announcements = await queryBuilder.getMany();

        
        const blockedUserRepository = new BlockedUserRepository();
        const blockedUserIds = await blockedUserRepository.getBlockedUserIds(userId);

        return announcements.filter(announcement => !blockedUserIds.includes(announcement.authorId));
    }

    async pinAnnouncement(id: string, userId: string): Promise<Announcement> {
        const announcement = await this.announcementRepository.findById(id);
        if (!announcement) {
            throw new Error('Ogłoszenie nie zostało znalezione');
        }

        const neighborhood = await this.neighborhoodRepository.findById(announcement.neighborhoodId);
        if (!neighborhood) {
            throw new Error('Osiedle nie istnieje');
        }

        if (neighborhood.adminId !== userId) {
            throw new Error('Tylko administrator osiedla może przypinać ogłoszenia');
        }

        
        const isPinned = !announcement.isPinned;

        
        await this.announcementRepository.getRepository().update(id, { isPinned });

        return this.announcementRepository.findById(id) as Promise<Announcement>;
    }

    async updateAnnouncement(
        id: string,
        userId: string,
        data: {
            title?: string;
            content?: string;
            type?: AnnouncementType;
            expiresAt?: Date;
        }
    ): Promise<Announcement> {
        const announcement = await this.announcementRepository.findById(id);
        if (!announcement) {
            throw new Error('Ogłoszenie nie zostało znalezione');
        }

        if (announcement.authorId !== userId) {
            throw new Error('Tylko autor może edytować ogłoszenie');
        }

        const updated = await this.announcementRepository.update(id, data);
        if (!updated) {
            throw new Error('Nie udało się zaktualizować ogłoszenia');
        }

        return updated;
    }

    async updateAnnouncementStatus(
        id: string,
        userId: string,
        status: AnnouncementStatus
    ): Promise<Announcement> {
        const announcement = await this.announcementRepository.findById(id);
        if (!announcement) {
            throw new Error('Ogłoszenie nie zostało znalezione');
        }

        if (announcement.authorId !== userId) {
            throw new Error('Tylko autor może zmienić status ogłoszenia');
        }

        
        if (status === AnnouncementStatus.ACTIVE) {
            await this.announcementRepository.clearAcceptedResponse(id);
        }

        const updated = await this.announcementRepository.updateStatus(id, status);
        if (!updated) {
            throw new Error('Nie udało się zmienić statusu ogłoszenia');
        }

        return updated;
    }

    async deleteAnnouncement(id: string, userId: string): Promise<void> {
        const announcement = await this.announcementRepository.findById(id);
        if (!announcement) {
            throw new Error('Ogłoszenie nie zostało znalezione');
        }

        const neighborhood = await this.neighborhoodRepository.findById(announcement.neighborhoodId);

        
        const isAdmin = neighborhood && neighborhood.adminId === userId;

        if (announcement.authorId !== userId && !isAdmin) {
            throw new Error('Nie masz uprawnień do usunięcia tego ogłoszenia');
        }

        const deleted = await this.announcementRepository.delete(id);
        if (!deleted) {
            throw new Error('Nie udało się usunąć ogłoszenia');
        }
    }

    async respondToAnnouncement(
        announcementId: string,
        userId: string,
        message?: string
    ): Promise<AnnouncementResponse> {
        const announcement = await this.announcementRepository.findById(announcementId);
        if (!announcement) {
            throw new Error('Ogłoszenie nie zostało znalezione');
        }

        
        if (announcement.status !== AnnouncementStatus.ACTIVE) {
            throw new Error('Nie można odpowiadać na to ogłoszenie - pomoc jest już w trakcie realizacji');
        }

        
        const isMember = await this.neighborhoodRepository.isMember(announcement.neighborhoodId, userId);
        if (!isMember) {
            throw new Error('Musisz być członkiem osiedla');
        }

        
        const existingResponse = await this.announcementRepository.findResponseByUserAndAnnouncement(
            userId,
            announcementId
        );
        if (existingResponse) {
            throw new Error('Już odpowiedziałeś na to ogłoszenie');
        }

        
        if (announcement.authorId === userId) {
            throw new Error('Nie możesz odpowiedzieć na własne ogłoszenie');
        }

        const response = await this.announcementRepository.addResponse({
            announcementId,
            userId,
            message,
        });

        
        const responder = await this.userRepository.findById(userId);
        if (responder) {
            const responderName = `${responder.firstName} ${responder.lastName}`;
            await this.notificationService.notifyNewResponse(
                announcement.authorId,
                userId,
                responderName,
                announcement.title,
                announcementId,
                announcement.neighborhoodId
            );
        }

        return response;
    }

    async withdrawResponse(announcementId: string, userId: string): Promise<void> {
        const announcement = await this.announcementRepository.findById(announcementId);
        if (!announcement) {
            throw new Error('Ogłoszenie nie zostało znalezione');
        }

        const response = await this.announcementRepository.findResponseByUserAndAnnouncement(
            userId,
            announcementId
        );
        if (!response) {
            throw new Error('Nie znaleziono Twojej odpowiedzi');
        }

        
        if (response.isAccepted) {
            throw new Error('Nie możesz wycofać zaakceptowanej oferty');
        }

        await this.announcementRepository.deleteResponse(response.id);
    }

    
    async acceptOffer(
        announcementId: string,
        responseId: string,
        userId: string
    ): Promise<Announcement> {
        const announcement = await this.announcementRepository.findById(announcementId);
        if (!announcement) {
            throw new Error('Ogłoszenie nie zostało znalezione');
        }

        if (announcement.authorId !== userId) {
            throw new Error('Tylko autor może zaakceptować ofertę');
        }

        if (announcement.status !== AnnouncementStatus.ACTIVE) {
            throw new Error('Nie można zaakceptować oferty - ogłoszenie nie jest aktywne');
        }

        const response = await this.announcementRepository.findResponseById(responseId);
        if (!response || response.announcementId !== announcementId) {
            throw new Error('Nie znaleziono oferty');
        }

        const updated = await this.announcementRepository.acceptResponse(announcementId, responseId);
        if (!updated) {
            throw new Error('Nie udało się zaakceptować oferty');
        }

        
        const author = await this.userRepository.findById(userId);
        if (author) {
            const authorName = `${author.firstName} ${author.lastName}`;
            await this.notificationService.notifyOfferAccepted(
                response.userId,
                authorName,
                announcement.title,
                announcementId,
                announcement.neighborhoodId
            );
        }

        return updated;
    }

    
    async recordView(announcementId: string, userId: string): Promise<boolean> {
        const announcement = await this.announcementRepository.findById(announcementId);
        if (!announcement) {
            return false;
        }

        
        if (announcement.authorId === userId) {
            return false;
        }

        return this.announcementRepository.recordView(announcementId, userId);
    }

    
    async getViewers(announcementId: string, userId: string): Promise<any[]> {
        const announcement = await this.announcementRepository.findById(announcementId);
        if (!announcement) {
            throw new Error('Ogłoszenie nie zostało znalezione');
        }

        
        if (announcement.authorId !== userId) {
            throw new Error('Tylko autor może zobaczyć kto wyświetlił ogłoszenie');
        }

        return this.announcementRepository.getViewers(announcementId);
    }

    
    async updateAnnouncementAsAdmin(
        id: string,
        data: {
            title?: string;
            content?: string;
            type?: AnnouncementType;
            status?: AnnouncementStatus;
        }
    ): Promise<Announcement> {
        const announcement = await this.announcementRepository.findById(id);
        if (!announcement) {
            throw new Error('Ogłoszenie nie zostało znalezione');
        }

        const updated = await this.announcementRepository.update(id, data);
        if (!updated) {
            throw new Error('Nie udało się zaktualizować ogłoszenia');
        }

        return updated;
    }

    async deleteAnnouncementAsAdmin(id: string): Promise<void> {
        const announcement = await this.announcementRepository.findById(id);
        if (!announcement) {
            throw new Error('Ogłoszenie nie zostało znalezione');
        }

        const deleted = await this.announcementRepository.delete(id);
        if (!deleted) {
            throw new Error('Nie udało się usunąć ogłoszenia');
        }
    }

    async getAllAnnouncements(options?: {
        page?: number;
        limit?: number;
        type?: AnnouncementType;
        status?: AnnouncementStatus;
    }): Promise<{ announcements: Announcement[]; total: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        const queryBuilder = this.announcementRepository
            .getRepository()
            .createQueryBuilder('announcement')
            .leftJoinAndSelect('announcement.author', 'author')
            .leftJoinAndSelect('announcement.neighborhood', 'neighborhood')
            .leftJoinAndSelect('announcement.responses', 'responses')
            .leftJoinAndSelect('responses.user', 'responseUser');

        if (options?.type) {
            queryBuilder.andWhere('announcement.type = :type', { type: options.type });
        }

        if (options?.status) {
            queryBuilder.andWhere('announcement.status = :status', { status: options.status });
        }

        queryBuilder.orderBy('announcement.isPinned', 'DESC')
            .addOrderBy('announcement.createdAt', 'DESC');

        const [announcements, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return { announcements, total };
    }
}

