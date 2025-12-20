import { IsUUID, IsInt, Min, Max, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateRatingDto {
    @IsUUID()
    toUserId: string;

    @IsUUID()
    announcementId: string;

    @IsInt()
    @Min(1)
    @Max(5)
    stars: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    comment?: string;
}
