import { AdminLogRepository } from '../repositories/admin-log.repository';
import { AdminLog, AdminActionType, TargetType } from '../entities/admin-log.entity';

export class AdminLogService {
    private adminLogRepository: AdminLogRepository;

    constructor() {
        this.adminLogRepository = new AdminLogRepository();
    }

    async logAction(
        adminId: string,
        action: AdminActionType,
        targetType: TargetType,
        targetId?: string,
        details?: object,
        ipAddress?: string
    ): Promise<AdminLog> {
        return this.adminLogRepository.create({
            action,
            adminId,
            targetType,
            targetId,
            details,
            ipAddress
        });
    }

    async getLogs(options?: {
        page?: number;
        limit?: number;
        action?: AdminActionType;
        adminId?: string;
        targetType?: TargetType;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{ logs: AdminLog[]; total: number }> {
        return this.adminLogRepository.findAll(options);
    }

    async getLogsByTarget(targetType: TargetType, targetId: string): Promise<AdminLog[]> {
        return this.adminLogRepository.findByTarget(targetType, targetId);
    }
}
