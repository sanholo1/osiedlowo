import { RatingRepository } from '../repositories/rating.repository';
import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database';
import { Announcement, AnnouncementStatus } from '../entities/announcement.entity';
import { AnnouncementResponse } from '../entities/announcement-response.entity';
import { CreateRatingDto, UpdateRatingDto } from '@dtos';
import { Rating } from '../entities/rating.entity';
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    HttpException
} from '@exceptions';

export class RatingService {
    private ratingRepository: RatingRepository;
    private announcementRepository: Repository<Announcement>;
    private announcementResponseRepository: Repository<AnnouncementResponse>;

    constructor() {
        this.ratingRepository = new RatingRepository();
        this.announcementRepository = AppDataSource.getRepository(Announcement);
        this.announcementResponseRepository = AppDataSource.getRepository(AnnouncementResponse);
    }

    async createRating(fromUserId: string, createRatingDto: CreateRatingDto): Promise<Rating> {
        const { toUserId, announcementId, stars, comment } = createRatingDto;

        
        if (fromUserId === toUserId) {
            throw new BadRequestException('Nie możesz ocenić sam siebie');
        }

        
        const announcement = await this.announcementRepository.findOne({
            where: { id: announcementId },
            relations: ['author']
        });

        if (!announcement) {
            throw new NotFoundException('Ogłoszenie nie zostało znalezione');
        }

        if (announcement.status !== AnnouncementStatus.RESOLVED) {
            throw new BadRequestException('Możesz ocenić tylko rozwiązane ogłoszenia');
        }

        
        const existingRating = await this.ratingRepository.findByUsers(fromUserId, toUserId, announcementId);
        if (existingRating) {
            throw new BadRequestException('Już wystawiłeś ocenę dla tego użytkownika w tym ogłoszeniu');
        }

        
        const isAuthor = announcement.authorId === fromUserId;

        let isAcceptedHelper = false;
        if (announcement.acceptedResponseId) {
            const acceptedResponse = await this.announcementResponseRepository.findOne({
                where: { id: announcement.acceptedResponseId }
            });
            isAcceptedHelper = acceptedResponse?.userId === fromUserId;
        }

        if (!isAuthor && !isAcceptedHelper) {
            throw new ForbiddenException('Nie brałeś udziału w tym ogłoszeniu');
        }

        
        if (isAuthor) {
            
            const acceptedResponse = await this.announcementResponseRepository.findOne({
                where: { id: announcement.acceptedResponseId }
            });
            if (!acceptedResponse || acceptedResponse.userId !== toUserId) {
                throw new BadRequestException('Możesz ocenić tylko osobę, która pomogła w ogłoszeniu');
            }
        } else if (isAcceptedHelper) {
            
            if (announcement.authorId !== toUserId) {
                throw new BadRequestException('Możesz ocenić tylko autora ogłoszenia');
            }
        }

        
        const rating = await this.ratingRepository.create({
            fromUserId,
            toUserId,
            announcementId,
            stars,
            comment: comment || null
        });

        return this.ratingRepository.findById(rating.id);
    }

    async updateRating(ratingId: string, userId: string, updateRatingDto: UpdateRatingDto): Promise<Rating> {
        const rating = await this.ratingRepository.findById(ratingId);

        if (!rating) {
            throw new NotFoundException('Ocena nie została znaleziona');
        }

        if (rating.fromUserId !== userId) {
            throw new ForbiddenException('Nie masz uprawnień do edycji tej oceny');
        }

        const updatedRating = await this.ratingRepository.update(ratingId, updateRatingDto);

        if (!updatedRating) {
            throw new HttpException('Nie udało się zaktualizować oceny', 500);
        }

        return updatedRating;
    }

    async deleteRating(ratingId: string, userId: string): Promise<void> {
        const rating = await this.ratingRepository.findById(ratingId);

        if (!rating) {
            throw new NotFoundException('Ocena nie została znaleziona');
        }

        if (rating.fromUserId !== userId) {
            throw new ForbiddenException('Nie masz uprawnień do usunięcia tej oceny');
        }

        const deleted = await this.ratingRepository.delete(ratingId);
        if (!deleted) {
            throw new HttpException('Nie udało się usunąć oceny', 500);
        }
    }

    async getUserRatings(userId: string): Promise<Rating[]> {
        return this.ratingRepository.findByToUser(userId);
    }

    async getRatingStats(userId: string): Promise<{ average: number; count: number }> {
        return this.ratingRepository.getAverageRating(userId);
    }
    
    async updateRatingAsAdmin(ratingId: string, updateRatingDto: UpdateRatingDto): Promise<Rating> {
        const rating = await this.ratingRepository.findById(ratingId);

        if (!rating) {
            throw new NotFoundException('Ocena nie została znaleziona');
        }

        const updatedRating = await this.ratingRepository.update(ratingId, updateRatingDto);

        if (!updatedRating) {
            throw new HttpException('Nie udało się zaktualizować oceny', 500);
        }

        return updatedRating;
    }

    async deleteRatingAsAdmin(ratingId: string): Promise<void> {
        const rating = await this.ratingRepository.findById(ratingId);

        if (!rating) {
            throw new NotFoundException('Ocena nie została znaleziona');
        }

        const deleted = await this.ratingRepository.delete(ratingId);
        if (!deleted) {
            throw new HttpException('Nie udało się usunąć oceny', 500);
        }
    }

    async getAllRatings(options?: {
        page?: number;
        limit?: number;
    }): Promise<{ ratings: Rating[]; total: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        const repository = this.ratingRepository['repository'];
        const [ratings, total] = await repository.findAndCount({
            relations: ['fromUser', 'toUser', 'announcement'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit
        });

        return { ratings, total };
    }
}
