import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { SystemAnnouncement, SystemAnnouncementPriority } from '../entities/system-announcement.entity';

export class SystemAnnouncementRepository {
    private repository: Repository<SystemAnnouncement>;

    constructor() {
        this.repository = AppDataSource.getRepository(SystemAnnouncement);
    }

    async create(data: {
        title: string;
        content: string;
        priority?: SystemAnnouncementPriority;
        isActive?: boolean;
        expiresAt?: Date;
        createdById: string;
    }): Promise<SystemAnnouncement> {
        const announcement = this.repository.create({
            title: data.title,
            content: data.content,
            priority: data.priority || SystemAnnouncementPriority.MEDIUM,
            isActive: data.isActive ?? true,
            expiresAt: data.expiresAt || null,
            createdById: data.createdById
        });
        return this.repository.save(announcement);
    }

    async findAll(options?: {
        page?: number;
        limit?: number;
        isActive?: boolean;
    }): Promise<{ announcements: SystemAnnouncement[]; total: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        const qb = this.repository.createQueryBuilder('announcement')
            .leftJoinAndSelect('announcement.createdBy', 'createdBy')
            .orderBy('announcement.createdAt', 'DESC');

        if (options?.isActive !== undefined) {
            qb.andWhere('announcement.isActive = :isActive', { isActive: options.isActive });
        }

        const [announcements, total] = await qb.skip(skip).take(limit).getManyAndCount();
        return { announcements, total };
    }

    async findActive(): Promise<SystemAnnouncement[]> {
        const now = new Date();
        return this.repository.createQueryBuilder('announcement')
            .leftJoinAndSelect('announcement.createdBy', 'createdBy')
            .where('announcement.isActive = :isActive', { isActive: true })
            .andWhere('(announcement.expiresAt IS NULL OR announcement.expiresAt > :now)', { now })
            .orderBy('FIELD(announcement.priority, "critical", "high", "medium", "low")')
            .addOrderBy('announcement.createdAt', 'DESC')
            .getMany();
    }

    async findById(id: string): Promise<SystemAnnouncement | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['createdBy']
        });
    }

    async update(id: string, data: Partial<SystemAnnouncement>): Promise<SystemAnnouncement | null> {
        await this.repository.update(id, data);
        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }
}
