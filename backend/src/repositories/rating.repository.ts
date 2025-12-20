import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database';
import { Rating } from '../entities/rating.entity';

export class RatingRepository {
    private repository: Repository<Rating>;

    constructor() {
        this.repository = AppDataSource.getRepository(Rating);
    }

    async create(ratingData: Partial<Rating>): Promise<Rating> {
        const rating = this.repository.create(ratingData);
        return this.repository.save(rating);
    }

    async findById(id: string): Promise<Rating | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['fromUser', 'toUser', 'announcement']
        });
    }

    async update(id: string, ratingData: Partial<Rating>): Promise<Rating | null> {
        await this.repository.update(id, ratingData);
        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }

    async findByUsers(fromUserId: string, toUserId: string, announcementId: string): Promise<Rating | null> {
        return this.repository.findOne({
            where: {
                fromUserId,
                toUserId,
                announcementId
            }
        });
    }

    async findByToUser(toUserId: string): Promise<Rating[]> {
        return this.repository.find({
            where: { toUserId },
            relations: ['fromUser'],
            order: { createdAt: 'DESC' }
        });
    }

    async getAverageRating(userId: string): Promise<{ average: number; count: number }> {
        const result = await this.repository
            .createQueryBuilder('rating')
            .select('AVG(rating.stars)', 'average')
            .addSelect('COUNT(rating.id)', 'count')
            .where('rating.toUserId = :userId', { userId })
            .getRawOne();

        return {
            average: result.average ? parseFloat(result.average) : 0,
            count: result.count ? parseInt(result.count) : 0
        };
    }
}
