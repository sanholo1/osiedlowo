import { AppDataSource } from '@config/database';
import { Announcement, AnnouncementType, AnnouncementStatus } from '../entities/announcement.entity';
import { AnnouncementResponse } from '../entities/announcement-response.entity';
import { AnnouncementView } from '../entities/announcement-view.entity';

export class AnnouncementRepository {
    private repository = AppDataSource.getRepository(Announcement);
    private responseRepository = AppDataSource.getRepository(AnnouncementResponse);
    private viewRepository = AppDataSource.getRepository(AnnouncementView);

    getRepository() {
        return this.repository;
    }

    async create(data: Partial<Announcement>): Promise<Announcement> {
        const announcement = this.repository.create(data);
        return this.repository.save(announcement);
    }

    async findById(id: string): Promise<Announcement | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['author', 'responses', 'responses.user'],
        });
    }

    async findByNeighborhood(
        neighborhoodId: string,
        options?: {
            type?: AnnouncementType;
            status?: AnnouncementStatus;
            authorId?: string;
        }
    ): Promise<Announcement[]> {
        const queryBuilder = this.repository
            .createQueryBuilder('announcement')
            .leftJoinAndSelect('announcement.author', 'author')
            .leftJoinAndSelect('announcement.responses', 'responses')
            .leftJoinAndSelect('responses.user', 'responseUser')
            .where('announcement.neighborhoodId = :neighborhoodId', { neighborhoodId })
            .orderBy('announcement.createdAt', 'DESC');

        if (options?.type) {
            queryBuilder.andWhere('announcement.type = :type', { type: options.type });
        }

        if (options?.status) {
            queryBuilder.andWhere('announcement.status = :status', { status: options.status });
        }

        if (options?.authorId) {
            queryBuilder.andWhere('announcement.authorId = :authorId', { authorId: options.authorId });
        }

        return queryBuilder.getMany();
    }

    async update(id: string, data: Partial<Announcement>): Promise<Announcement | null> {
        await this.repository.update(id, data);
        return this.findById(id);
    }

    async updateStatus(id: string, status: AnnouncementStatus): Promise<Announcement | null> {
        await this.repository.update(id, { status });
        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }

    async addResponse(data: Partial<AnnouncementResponse>): Promise<AnnouncementResponse> {
        const response = this.responseRepository.create(data);
        return this.responseRepository.save(response);
    }

    async findResponseById(id: string): Promise<AnnouncementResponse | null> {
        return this.responseRepository.findOne({
            where: { id },
            relations: ['user'],
        });
    }

    async findResponseByUserAndAnnouncement(userId: string, announcementId: string): Promise<AnnouncementResponse | null> {
        return this.responseRepository.findOne({
            where: { userId, announcementId },
        });
    }

    async updateResponse(id: string, data: Partial<AnnouncementResponse>): Promise<AnnouncementResponse | null> {
        await this.responseRepository.update(id, data);
        return this.findResponseById(id);
    }

    async deleteResponse(id: string): Promise<boolean> {
        const result = await this.responseRepository.delete(id);
        return result.affected !== 0;
    }

    async countResponses(announcementId: string): Promise<number> {
        return this.responseRepository.count({
            where: { announcementId },
        });
    }

    
    async recordView(announcementId: string, userId: string): Promise<boolean> {
        try {
            
            const existingView = await this.viewRepository.findOne({
                where: { announcementId, userId },
            });

            if (existingView) {
                return false; 
            }

            
            const view = this.viewRepository.create({ announcementId, userId });
            await this.viewRepository.save(view);

            
            await this.repository.increment({ id: announcementId }, 'viewCount', 1);

            return true;
        } catch {
            return false;
        }
    }

    async getViewers(announcementId: string): Promise<AnnouncementView[]> {
        return this.viewRepository.find({
            where: { announcementId },
            relations: ['user'],
            order: { viewedAt: 'DESC' },
        });
    }

    
    async acceptResponse(announcementId: string, responseId: string): Promise<Announcement | null> {
        
        await this.responseRepository.update(responseId, { isAccepted: true });

        
        await this.repository.update(announcementId, {
            status: AnnouncementStatus.IN_PROGRESS,
            acceptedResponseId: responseId,
        });

        return this.findById(announcementId);
    }

    
    async clearAcceptedResponse(announcementId: string): Promise<void> {
        const announcement = await this.repository.findOne({ where: { id: announcementId } });
        if (announcement && announcement.acceptedResponseId) {
            
            await this.responseRepository.update(announcement.acceptedResponseId, { isAccepted: false });

            
            await this.repository.update(announcementId, { acceptedResponseId: null });
        }
    }
}

