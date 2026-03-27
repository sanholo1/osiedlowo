import { Request, Response } from 'express';
import { NeighborhoodService } from '../services/neighborhood.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class NeighborhoodController {
    private neighborhoodService: NeighborhoodService;

    constructor() {
        this.neighborhoodService = new NeighborhoodService();
    }

    getAllNeighborhoods = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { mode, q } = req.query;
            const userId = req.user!.userId;

            console.log('getAllNeighborhoods params:', { mode, q, userId });

            let neighborhoods;

            if (mode === 'my') {
                console.log('Fetching user neighborhoods');
                neighborhoods = await this.neighborhoodService.getUserNeighborhoods(userId);
            } else if (q) {
                console.log('Searching neighborhoods:', q);
                neighborhoods = await this.neighborhoodService.searchNeighborhoods(q as string, userId);
            } else {
                console.log('Fetching all neighborhoods');
                neighborhoods = await this.neighborhoodService.getAllNeighborhoods();
            }

            res.json(neighborhoods);
        } catch (error: any) {
            console.error('Error in getAllNeighborhoods:', error);
            res.status(500).json({ message: error.message });
        }
    };

    getNeighborhoodById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const neighborhood = await this.neighborhoodService.getNeighborhoodById(id);

            if (!neighborhood) {
                return res.status(404).json({ message: 'Sąsiedztwo nie znalezione' });
            }

            res.json(neighborhood);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    createNeighborhood = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { name, city } = req.body;
            const adminId = req.user!.userId;

            if (!name || !city) {
                return res.status(400).json({ message: 'Nazwa i miasto są wymagane' });
            }

            const neighborhood = await this.neighborhoodService.createNeighborhood({
                name,
                city,
                adminId
            });

            res.status(201).json(neighborhood);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    joinNeighborhood = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            await this.neighborhoodService.joinNeighborhood(id, userId);
            res.json({ message: 'Dołączono do sąsiedztwa' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    leaveNeighborhood = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            await this.neighborhoodService.leaveNeighborhood(id, userId);
            res.json({ message: 'Opuszczono sąsiedztwo' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    deleteNeighborhood = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            await this.neighborhoodService.deleteNeighborhood(id, userId);
            res.json({ message: 'Sąsiedztwo zostało usunięte' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };
}
