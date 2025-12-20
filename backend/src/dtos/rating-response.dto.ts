import { Rating } from '../entities/rating.entity';

export class RatingResponseDto {
    id: string;
    fromUserId: string;
    toUserId: string;
    announcementId: string;
    stars: number;
    comment: string;
    fromUser: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: Date;
    updatedAt: Date;

    static fromEntity(rating: Rating): RatingResponseDto {
        const dto = new RatingResponseDto();
        dto.id = rating.id;
        dto.fromUserId = rating.fromUserId;
        dto.toUserId = rating.toUserId;
        dto.announcementId = rating.announcementId;
        dto.stars = rating.stars;
        dto.comment = rating.comment;
        dto.fromUser = rating.fromUser ? {
            id: rating.fromUser.id,
            firstName: rating.fromUser.firstName,
            lastName: rating.fromUser.lastName,
        } : null;
        dto.createdAt = rating.createdAt;
        dto.updatedAt = rating.updatedAt;
        return dto;
    }

    static fromEntities(ratings: Rating[]): RatingResponseDto[] {
        return ratings.map(rating => this.fromEntity(rating));
    }
}
