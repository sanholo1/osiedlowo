import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { BlockedUser } from '../entities/blocked-user.entity';

export class BlockedUserRepository {
    private repository: Repository<BlockedUser>;

    constructor() {
        this.repository = AppDataSource.getRepository(BlockedUser);
    }

    async create(userId: string, blockedUserId: string): Promise<BlockedUser> {
        const blockedUser = this.repository.create({
            userId,
            blockedUserId
        });
        return this.repository.save(blockedUser);
    }

    async delete(userId: string, blockedUserId: string): Promise<boolean> {
        const result = await this.repository.delete({
            userId,
            blockedUserId
        });
        return result.affected !== 0;
    }

    async findBlockedUsers(userId: string): Promise<BlockedUser[]> {
        return this.repository.find({
            where: { userId },
            relations: ['blockedUser'],
            order: { createdAt: 'DESC' }
        });
    }

    async isBlocked(userId: string, blockedUserId: string): Promise<boolean> {
        const count = await this.repository.count({
            where: {
                userId,
                blockedUserId
            }
        });
        return count > 0;
    }

    async getBlockedUserIds(userId: string): Promise<string[]> {
        const blockedUsers = await this.repository.find({
            where: { userId },
            select: ['blockedUserId']
        });
        return blockedUsers.map(bu => bu.blockedUserId);
    }
}
