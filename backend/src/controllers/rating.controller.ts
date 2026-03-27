import { Request, Response, NextFunction } from 'express';
import { RatingService } from '../services/rating.service';
import { CreateRatingDto, UpdateRatingDto, RatingResponseDto } from '@dtos';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class RatingController {
    private ratingService: RatingService;

    constructor() {
        this.ratingService = new RatingService();
    }

    createRating = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user.userId;
            const createRatingDto = plainToInstance(CreateRatingDto, req.body);
            const errors = await validate(createRatingDto);

            if (errors.length > 0) {
                const messages = errors.map(err => Object.values(err.constraints || {})).flat();
                res.status(400).json({
                    status: 'ERROR',
                    message: 'Błąd walidacji',
                    errors: messages
                });
                return;
            }

            const rating = await this.ratingService.createRating(userId, createRatingDto);
            const responseDto = RatingResponseDto.fromEntity(rating);

            res.status(201).json({
                status: 'OK',
                message: 'Ocena została utworzona',
                data: responseDto
            });
        } catch (error) {
            next(error);
        }
    };

    updateRating = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user.userId;
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

            const rating = await this.ratingService.updateRating(id, userId, updateRatingDto);
            const responseDto = RatingResponseDto.fromEntity(rating);

            res.json({
                status: 'OK',
                message: 'Ocena została zaktualizowana',
                data: responseDto
            });
        } catch (error) {
            next(error);
        }
    };

    deleteRating = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;

            await this.ratingService.deleteRating(id, userId);

            res.json({
                status: 'OK',
                message: 'Ocena została usunięta'
            });
        } catch (error) {
            next(error);
        }
    };

    getUserRatings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId } = req.params;

            const ratings = await this.ratingService.getUserRatings(userId);
            const responseDto = RatingResponseDto.fromEntities(ratings);

            res.json({
                status: 'OK',
                data: responseDto
            });
        } catch (error) {
            next(error);
        }
    };

    getRatingStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId } = req.params;

            const stats = await this.ratingService.getRatingStats(userId);

            res.json({
                status: 'OK',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    };
}
