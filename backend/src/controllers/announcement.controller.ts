import { Request, Response } from 'express';
import { AnnouncementService } from '../services/announcement.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AnnouncementType, AnnouncementStatus } from '../entities/announcement.entity';

export class AnnouncementController {
    private announcementService: AnnouncementService;

    constructor() {
        this.announcementService = new AnnouncementService();
    }

    createAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id: neighborhoodId } = req.params;
            const { title, content, type, expiresAt } = req.body;
            const userId = req.user!.userId;

            if (!title || !content) {
                return res.status(400).json({ message: 'Tytuł i treść są wymagane' });
            }

            const announcement = await this.announcementService.createAnnouncement({
                title,
                content,
                type: type || AnnouncementType.INFO,
                authorId: userId,
                neighborhoodId,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            });

            res.status(201).json(announcement);
        } catch (error: any) {
            console.error('createAnnouncement error:', error);
            const status = error.statusCode || 400;
            res.status(status).json({ message: error.message });
        }
    };

    getAnnouncementsByNeighborhood = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id: neighborhoodId } = req.params;
            const { type, status, authorId } = req.query;
            const userId = req.user!.userId;

            const announcements = await this.announcementService.getAnnouncementsByNeighborhood(
                neighborhoodId,
                userId,
                {
                    type: type as AnnouncementType | undefined,
                    status: status as AnnouncementStatus | undefined,
                    authorId: authorId as string | undefined,
                }
            );

            res.json(announcements);
        } catch (error: any) {
            console.error('getAnnouncementsByNeighborhood error:', error);
            const status = error.statusCode || 400;
            res.status(status).json({ message: error.message });
        }
    };

    getAnnouncementById = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;

            const announcement = await this.announcementService.getAnnouncementById(id);
            if (!announcement) {
                return res.status(404).json({ message: 'Ogłoszenie nie zostało znalezione' });
            }

            res.json(announcement);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    updateAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const { title, content, type, expiresAt } = req.body;
            const userId = req.user!.userId;

            const announcement = await this.announcementService.updateAnnouncement(id, userId, {
                title,
                content,
                type,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            });

            res.json(announcement);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    updateAnnouncementStatus = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user!.userId;

            if (!status || !Object.values(AnnouncementStatus).includes(status)) {
                return res.status(400).json({ message: 'Nieprawidłowy status' });
            }

            const announcement = await this.announcementService.updateAnnouncementStatus(
                id,
                userId,
                status
            );

            res.json(announcement);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    pinAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            const announcement = await this.announcementService.pinAnnouncement(id, userId);

            res.json(announcement);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    deleteAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            await this.announcementService.deleteAnnouncement(id, userId);
            res.json({ message: 'Ogłoszenie zostało usunięte' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    respondToAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const { message } = req.body;
            const userId = req.user!.userId;

            const response = await this.announcementService.respondToAnnouncement(
                id,
                userId,
                message
            );

            res.status(201).json(response);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    withdrawResponse = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            await this.announcementService.withdrawResponse(id, userId);
            res.json({ message: 'Odpowiedź została wycofana' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    acceptOffer = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id, responseId } = req.params;
            const userId = req.user!.userId;

            const announcement = await this.announcementService.acceptOffer(id, responseId, userId);
            res.json(announcement);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    recordView = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            const recorded = await this.announcementService.recordView(id, userId);
            res.json({ recorded });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    getViewers = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            const viewers = await this.announcementService.getViewers(id, userId);
            res.json(viewers);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };
}

