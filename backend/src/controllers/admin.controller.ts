import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AnnouncementService } from '../services/announcement.service';
import { RatingService } from '../services/rating.service';
import { NeighborhoodService } from '../services/neighborhood.service';
import { AdminLogService } from '../services/admin-log.service';
import { SystemAnnouncementService } from '../services/system-announcement.service';
import { ChatService } from '../services/chat.service';
import { NotificationService } from '../services/notification.service';
import { UpdateRatingDto } from '@dtos';
import { AnnouncementType, AnnouncementStatus } from '../entities/announcement.entity';
import { AdminActionType, TargetType } from '../entities/admin-log.entity';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class AdminController {
    private userService: UserService;
    private announcementService: AnnouncementService;
    private ratingService: RatingService;
    private neighborhoodService: NeighborhoodService;
    private adminLogService: AdminLogService;
    private systemAnnouncementService: SystemAnnouncementService;
    private chatService: ChatService;
    private notificationService: NotificationService;

    constructor() {
        this.userService = new UserService();
        this.announcementService = new AnnouncementService();
        this.ratingService = new RatingService();
        this.neighborhoodService = new NeighborhoodService();
        this.adminLogService = new AdminLogService();
        this.systemAnnouncementService = new SystemAnnouncementService();
        this.chatService = new ChatService();
        this.notificationService = new NotificationService();
    }


    getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { total: totalUsers } = await this.userService.getAllUsersWithPagination({ page: 1, limit: 1 });
            const { total: totalAnnouncements } = await this.announcementService.getAllAnnouncements({ page: 1, limit: 1 });
            const { total: totalRatings } = await this.ratingService.getAllRatings({ page: 1, limit: 1 });
            const neighborhoods = await this.neighborhoodService.getAllNeighborhoods();

            res.json({
                status: 'OK',
                data: {
                    totalUsers,
                    totalAnnouncements,
                    totalRatings,
                    totalNeighborhoods: neighborhoods.length
                }
            });
        } catch (error) {
            next(error);
        }
    };


    getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const search = req.query.search as string;

            const result = await this.userService.getAllUsersWithPagination({ page, limit, search });

            res.json({
                status: 'OK',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { role } = req.body;

            const user = await this.userService.updateUserRole(id, role);

            res.json({
                status: 'OK',
                message: 'Rola użytkownika została zaktualizowana',
                data: user
            });
        } catch (error) {
            next(error);
        }
    };

    toggleUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;

            const user = await this.userService.update(id, { isActive });

            res.json({
                status: 'OK',
                message: `Użytkownik został ${isActive ? 'aktywowany' : 'zablokowany'}`,
                data: user
            });
        } catch (error) {
            next(error);
        }
    };

    deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            await this.userService.deleteUserAsAdmin(id);

            res.json({
                status: 'OK',
                message: 'Użytkownik został usunięty'
            });
        } catch (error) {
            next(error);
        }
    };

    updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { firstName, lastName, email, address, attributes } = req.body;
            const adminId = (req as any).user.userId;

            const user = await this.userService.updateUserAsAdmin(id, {
                firstName,
                lastName,
                email,
                address,
                attributes
            });

            await this.adminLogService.logAction(
                adminId,
                AdminActionType.USER_UPDATED,
                TargetType.USER,
                id,
                { firstName, lastName, email, address }
            );

            res.json({
                status: 'OK',
                message: 'Dane użytkownika zostały zaktualizowane',
                data: user
            });
        } catch (error) {
            next(error);
        }
    };


    getAnnouncements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const type = req.query.type as AnnouncementType;
            const status = req.query.status as AnnouncementStatus;

            const result = await this.announcementService.getAllAnnouncements({ page, limit, type, status });

            res.json({
                status: 'OK',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    updateAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { title, content, type, status } = req.body;

            const announcement = await this.announcementService.updateAnnouncementAsAdmin(id, {
                title,
                content,
                type,
                status
            });

            res.json({
                status: 'OK',
                message: 'Ogłoszenie zostało zaktualizowane',
                data: announcement
            });
        } catch (error) {
            next(error);
        }
    };

    deleteAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            await this.announcementService.deleteAnnouncementAsAdmin(id);

            res.json({
                status: 'OK',
                message: 'Ogłoszenie zostało usunięte'
            });
        } catch (error) {
            next(error);
        }
    };


    getRatings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await this.ratingService.getAllRatings({ page, limit });

            res.json({
                status: 'OK',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    updateRating = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const updateRatingDto = plainToInstance(UpdateRatingDto, req.body);
            const errors = await validate(updateRatingDto);

            if (errors.length > 0) {
                const messages = errors.map(err => Object.values(err.constraints || {})).flat();
                res.status(400).json({
                    status: 'ERROR',
                    message: 'Błąd walidacji',
                    errors: messages
                });
                return;
            }

            const rating = await this.ratingService.updateRatingAsAdmin(id, updateRatingDto);

            res.json({
                status: 'OK',
                message: 'Ocena została zaktualizowana',
                data: rating
            });
        } catch (error) {
            next(error);
        }
    };

    deleteRating = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            await this.ratingService.deleteRatingAsAdmin(id);

            res.json({
                status: 'OK',
                message: 'Ocena została usunięta'
            });
        } catch (error) {
            next(error);
        }
    };


    getNeighborhoods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const neighborhoods = await this.neighborhoodService.getAllNeighborhoods();

            res.json({
                status: 'OK',
                data: neighborhoods
            });
        } catch (error) {
            next(error);
        }
    };

    removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id, userId } = req.params;

            await this.neighborhoodService.removeMemberAsAdmin(id, userId);

            res.json({
                status: 'OK',
                message: 'Użytkownik został usunięty z sąsiedztwa'
            });
        } catch (error) {
            next(error);
        }
    };

    deleteNeighborhood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            // logic is handled in service, we just pass admin id as user but role 'admin'
            // Wait, deleteNeighborhood in service expects (neighborhoodId, userId, userRole)
            const adminId = (req as any).user.userId;

            await this.neighborhoodService.deleteNeighborhood(id, adminId, 'admin');

            res.json({
                status: 'OK',
                message: 'Osiedle zostało usunięte'
            });
        } catch (error) {
            next(error);
        }
    };

    updateNeighborhood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const data = req.body;

            const neighborhood = await this.neighborhoodService.updateNeighborhoodAsAdmin(id, data);

            res.json({
                status: 'OK',
                message: 'Osiedle zostało zaktualizowane',
                data: neighborhood
            });
        } catch (error) {
            next(error);
        }
    };

    // ============ ADMIN LOGS ============
    getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const action = req.query.action as AdminActionType;
            const targetType = req.query.targetType as TargetType;

            const result = await this.adminLogService.getLogs({ page, limit, action, targetType });

            res.json({
                status: 'OK',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    getLoginHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const { users } = await this.userService.getAllUsersWithPagination({ page, limit });
            const loginHistory = users
                .filter(u => u.lastLoginAt)
                .map(u => ({
                    userId: u.id,
                    email: u.email,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    lastLoginAt: u.lastLoginAt
                }))
                .sort((a, b) => new Date(b.lastLoginAt!).getTime() - new Date(a.lastLoginAt!).getTime());

            res.json({
                status: 'OK',
                data: { logins: loginHistory, total: loginHistory.length }
            });
        } catch (error) {
            next(error);
        }
    };

    // ============ SYSTEM ANNOUNCEMENTS ============
    getSystemAnnouncements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

            const result = await this.systemAnnouncementService.getAll({ page, limit, isActive });

            res.json({
                status: 'OK',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    createSystemAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const adminId = (req as any).user.userId;
            const { title, content, priority, isActive, expiresAt } = req.body;

            const announcement = await this.systemAnnouncementService.create({
                title,
                content,
                priority,
                isActive,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                createdById: adminId
            });

            await this.adminLogService.logAction(
                adminId,
                AdminActionType.SYSTEM_ANNOUNCEMENT_CREATED,
                TargetType.SYSTEM_ANNOUNCEMENT,
                announcement.id,
                { title }
            );

            // Notify all active users about the new system announcement
            if (isActive !== false) {
                await this.notificationService.notifySystemAnnouncement(
                    announcement.id,
                    title,
                    content
                );
            }

            res.json({
                status: 'OK',
                message: 'Ogłoszenie systemowe zostało utworzone',
                data: announcement
            });
        } catch (error) {
            next(error);
        }
    };

    updateSystemAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const adminId = (req as any).user.userId;
            const data = req.body;

            if (data.expiresAt) {
                data.expiresAt = new Date(data.expiresAt);
            }

            const announcement = await this.systemAnnouncementService.update(id, data);

            await this.adminLogService.logAction(
                adminId,
                AdminActionType.SYSTEM_ANNOUNCEMENT_UPDATED,
                TargetType.SYSTEM_ANNOUNCEMENT,
                id,
                data
            );

            res.json({
                status: 'OK',
                message: 'Ogłoszenie systemowe zostało zaktualizowane',
                data: announcement
            });
        } catch (error) {
            next(error);
        }
    };

    deleteSystemAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const adminId = (req as any).user.userId;

            await this.systemAnnouncementService.delete(id);
            await this.notificationService.deleteSystemAnnouncementNotifications(id);

            await this.adminLogService.logAction(
                adminId,
                AdminActionType.SYSTEM_ANNOUNCEMENT_DELETED,
                TargetType.SYSTEM_ANNOUNCEMENT,
                id
            );

            res.json({
                status: 'OK',
                message: 'Ogłoszenie systemowe zostało usunięte'
            });
        } catch (error) {
            next(error);
        }
    };

    // ============ CONTENT MODERATION ============
    pinAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { isPinned } = req.body;
            const adminId = (req as any).user.userId;

            const announcement = await this.announcementService.updateAnnouncementAsAdmin(id, { isPinned });

            await this.adminLogService.logAction(
                adminId,
                isPinned ? AdminActionType.ANNOUNCEMENT_PINNED : AdminActionType.ANNOUNCEMENT_UNPINNED,
                TargetType.ANNOUNCEMENT,
                id
            );

            res.json({
                status: 'OK',
                message: isPinned ? 'Ogłoszenie zostało przypięte' : 'Ogłoszenie zostało odpięte',
                data: announcement
            });
        } catch (error) {
            next(error);
        }
    };

    flagAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { isFlagged, flagReason } = req.body;
            const adminId = (req as any).user.userId;

            const announcement = await this.announcementService.updateAnnouncementAsAdmin(id, { isFlagged, flagReason });

            await this.adminLogService.logAction(
                adminId,
                isFlagged ? AdminActionType.ANNOUNCEMENT_FLAGGED : AdminActionType.ANNOUNCEMENT_UNFLAGGED,
                TargetType.ANNOUNCEMENT,
                id,
                { flagReason }
            );

            res.json({
                status: 'OK',
                message: isFlagged ? 'Ogłoszenie zostało oflagowane' : 'Flaga została usunięta',
                data: announcement
            });
        } catch (error) {
            next(error);
        }
    };

    bulkDeleteAnnouncements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { ids } = req.body;
            const adminId = (req as any).user.userId;

            if (!Array.isArray(ids) || ids.length === 0) {
                res.status(400).json({ status: 'ERROR', message: 'Brak ID ogłoszeń do usunięcia' });
                return;
            }

            for (const id of ids) {
                await this.announcementService.deleteAnnouncementAsAdmin(id);
                await this.adminLogService.logAction(
                    adminId,
                    AdminActionType.ANNOUNCEMENT_DELETED,
                    TargetType.ANNOUNCEMENT,
                    id
                );
            }

            res.json({
                status: 'OK',
                message: `Usunięto ${ids.length} ogłoszeń`
            });
        } catch (error) {
            next(error);
        }
    };

    // ============ CONVERSATION MODERATION ============
    getConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const conversations = await this.chatService.getAllGroupConversations();

            res.json({
                status: 'OK',
                data: conversations
            });
        } catch (error) {
            next(error);
        }
    };

    getConversationMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const messages = await this.chatService.getMessagesForAdmin(id, page, limit);

            res.json({
                status: 'OK',
                data: messages
            });
        } catch (error) {
            next(error);
        }
    };

    deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const adminId = (req as any).user.userId;

            await this.chatService.deleteMessageAsAdmin(id);

            await this.adminLogService.logAction(
                adminId,
                AdminActionType.MESSAGE_DELETED,
                TargetType.MESSAGE,
                id
            );

            res.json({
                status: 'OK',
                message: 'Wiadomość została usunięta'
            });
        } catch (error) {
            next(error);
        }
    };

    // ============ EXTENDED STATISTICS ============
    getExtendedStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { users } = await this.userService.getAllUsersWithPagination({ limit: 10000 });
            const { announcements } = await this.announcementService.getAllAnnouncements({ limit: 10000 });
            const neighborhoods = await this.neighborhoodService.getAllNeighborhoods();

            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const usersLast30Days = users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;
            const usersLast7Days = users.filter(u => new Date(u.createdAt) >= sevenDaysAgo).length;
            const activeUsers = users.filter(u => u.isActive).length;
            const blockedUsers = users.filter(u => !u.isActive).length;

            const announcementsLast30Days = announcements.filter(a => new Date(a.createdAt) >= thirtyDaysAgo).length;
            const announcementsLast7Days = announcements.filter(a => new Date(a.createdAt) >= sevenDaysAgo).length;

            const announcementsByType: Record<string, number> = {};
            announcements.forEach(a => {
                announcementsByType[a.type] = (announcementsByType[a.type] || 0) + 1;
            });

            const announcementsByStatus: Record<string, number> = {};
            announcements.forEach(a => {
                announcementsByStatus[a.status] = (announcementsByStatus[a.status] || 0) + 1;
            });

            const dailyRegistrations: Record<string, number> = {};
            users.forEach(u => {
                const date = new Date(u.createdAt).toISOString().split('T')[0];
                dailyRegistrations[date] = (dailyRegistrations[date] || 0) + 1;
            });

            const dailyAnnouncements: Record<string, number> = {};
            announcements.forEach(a => {
                const date = new Date(a.createdAt).toISOString().split('T')[0];
                dailyAnnouncements[date] = (dailyAnnouncements[date] || 0) + 1;
            });

            res.json({
                status: 'OK',
                data: {
                    users: {
                        total: users.length,
                        active: activeUsers,
                        blocked: blockedUsers,
                        last7Days: usersLast7Days,
                        last30Days: usersLast30Days,
                        dailyRegistrations
                    },
                    announcements: {
                        total: announcements.length,
                        last7Days: announcementsLast7Days,
                        last30Days: announcementsLast30Days,
                        byType: announcementsByType,
                        byStatus: announcementsByStatus,
                        dailyAnnouncements
                    },
                    neighborhoods: {
                        total: neighborhoods.length,
                        privateCount: neighborhoods.filter(n => n.isPrivate).length,
                        publicCount: neighborhoods.filter(n => !n.isPrivate).length
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    };

    // ============ DATA EXPORT ============
    exportUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { users } = await this.userService.getAllUsersWithPagination({ limit: 100000 });

            const csvHeader = 'ID,Email,Imię,Nazwisko,Rola,Aktywny,Data rejestracji,Ostatnie logowanie\n';
            const csvRows = users.map(u =>
                `${u.id},${u.email},${u.firstName || ''},${u.lastName || ''},${u.role},${u.isActive},${u.createdAt},${u.lastLoginAt || ''}`
            ).join('\n');

            const csv = csvHeader + csvRows;

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
            res.send(csv);
        } catch (error) {
            next(error);
        }
    };

    exportStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { users } = await this.userService.getAllUsersWithPagination({ limit: 100000 });
            const { announcements } = await this.announcementService.getAllAnnouncements({ limit: 100000 });
            const neighborhoods = await this.neighborhoodService.getAllNeighborhoods();
            const { ratings } = await this.ratingService.getAllRatings({ limit: 100000 });

            const stats = {
                exportDate: new Date().toISOString(),
                users: {
                    total: users.length,
                    active: users.filter(u => u.isActive).length,
                    blocked: users.filter(u => !u.isActive).length,
                    admins: users.filter(u => u.role === 'admin').length
                },
                announcements: {
                    total: announcements.length,
                    pinned: announcements.filter(a => a.isPinned).length,
                    flagged: announcements.filter(a => a.isFlagged).length
                },
                neighborhoods: {
                    total: neighborhoods.length,
                    private: neighborhoods.filter(n => n.isPrivate).length,
                    public: neighborhoods.filter(n => !n.isPrivate).length
                },
                ratings: {
                    total: ratings.length
                }
            };

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=stats_export.json');
            res.json(stats);
        } catch (error) {
            next(error);
        }
    };
}
