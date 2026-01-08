import { SystemAnnouncementRepository } from '../repositories/system-announcement.repository';
import { SystemAnnouncement, SystemAnnouncementPriority } from '../entities/system-announcement.entity';

export class SystemAnnouncementService {
    private systemAnnouncementRepository: SystemAnnouncementRepository;

    constructor() {
        this.systemAnnouncementRepository = new SystemAnnouncementRepository();
    }

    async create(data: {
        title: string;
        content: string;
        priority?: SystemAnnouncementPriority;
        isActive?: boolean;
        expiresAt?: Date;
        createdById: string;
    }): Promise<SystemAnnouncement> {
        return this.systemAnnouncementRepository.create(data);
    }

    async getAll(options?: {
        page?: number;
        limit?: number;
        isActive?: boolean;
    }): Promise<{ announcements: SystemAnnouncement[]; total: number }> {
        return this.systemAnnouncementRepository.findAll(options);
    }

    async getActive(): Promise<SystemAnnouncement[]> {
        return this.systemAnnouncementRepository.findActive();
    }

    async getById(id: string): Promise<SystemAnnouncement | null> {
        return this.systemAnnouncementRepository.findById(id);
    }

    async update(id: string, data: Partial<SystemAnnouncement>): Promise<SystemAnnouncement | null> {
        const announcement = await this.systemAnnouncementRepository.findById(id);
        if (!announcement) {
            throw new Error('Ogłoszenie systemowe nie zostało znalezione');
        }
        return this.systemAnnouncementRepository.update(id, data);
    }

    async delete(id: string): Promise<void> {
        const announcement = await this.systemAnnouncementRepository.findById(id);
        if (!announcement) {
            throw new Error('Ogłoszenie systemowe nie zostało znalezione');
        }
        await this.systemAnnouncementRepository.delete(id);
    }
}
