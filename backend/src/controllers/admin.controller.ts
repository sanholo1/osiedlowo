import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AnnouncementService } from '../services/announcement.service';
import { RatingService } from '../services/rating.service';
import { NeighborhoodService } from '../services/neighborhood.service';
import { UpdateRatingDto } from '@dtos';
import { AnnouncementType, AnnouncementStatus } from '../entities/announcement.entity';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class AdminController {
    private userService: UserService;
    private announcementService: AnnouncementService;
    private ratingService: RatingService;
    private neighborhoodService: NeighborhoodService;

    constructor() {
        this.userService = new UserService();
        this.announcementService = new AnnouncementService();
        this.ratingService = new RatingService();
        this.neighborhoodService = new NeighborhoodService();
    }

    
    getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            
            const { users } = await this.userService.getAllUsersWithPagination({ page: 1, limit: 1 });
            const { announcements } = await this.announcementService.getAllAnnouncements({ page: 1, limit: 1 });
            const { ratings } = await this.ratingService.getAllRatings({ page: 1, limit: 1 });
            const neighborhoods = await this.neighborhoodService.getAllNeighborhoods();

            res.json({
                status: 'OK',
                data: {
                    totalUsers: users.length,
                    totalAnnouncements: announcements.length,
                    totalRatings: ratings.length,
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
}
