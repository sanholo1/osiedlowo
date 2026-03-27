import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { AdminLog, AdminActionType, TargetType } from '../entities/admin-log.entity';

export class AdminLogRepository {
    private repository: Repository<AdminLog>;

    constructor() {
        this.repository = AppDataSource.getRepository(AdminLog);
    }

    async create(data: {
        action: AdminActionType;
        adminId: string;
        targetType: TargetType;
        targetId?: string;
        details?: object;
        ipAddress?: string;
    }): Promise<AdminLog> {
        const log = this.repository.create({
            action: data.action,
            adminId: data.adminId,
            targetType: data.targetType,
            targetId: data.targetId || null,
            details: data.details || null,
            ipAddress: data.ipAddress || null
        });
        return this.repository.save(log);
    }

    async findAll(options?: {
        page?: number;
        limit?: number;
        action?: AdminActionType;
        adminId?: string;
        targetType?: TargetType;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{ logs: AdminLog[]; total: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        const qb = this.repository.createQueryBuilder('log')
            .leftJoinAndSelect('log.admin', 'admin')
            .orderBy('log.createdAt', 'DESC');

        if (options?.action) {
            qb.andWhere('log.action = :action', { action: options.action });
        }

        if (options?.adminId) {
            qb.andWhere('log.adminId = :adminId', { adminId: options.adminId });
        }

        if (options?.targetType) {
            qb.andWhere('log.targetType = :targetType', { targetType: options.targetType });
        }

        if (options?.startDate) {
            qb.andWhere('log.createdAt >= :startDate', { startDate: options.startDate });
        }

        if (options?.endDate) {
            qb.andWhere('log.createdAt <= :endDate', { endDate: options.endDate });
        }

        const [logs, total] = await qb.skip(skip).take(limit).getManyAndCount();
        return { logs, total };
    }

    async findByTarget(targetType: TargetType, targetId: string): Promise<AdminLog[]> {
        return this.repository.find({
            where: { targetType, targetId },
            relations: ['admin'],
            order: { createdAt: 'DESC' }
        });
    }
}
