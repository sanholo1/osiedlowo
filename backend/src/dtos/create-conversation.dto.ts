import { IsEnum, IsString, IsArray, IsUUID, IsOptional, ArrayMinSize } from 'class-validator';
import { ConversationType } from '@entities/conversation.entity';

export class CreateConversationDto {
    @IsEnum(ConversationType)
    type: ConversationType;

    @IsString()
    @IsOptional()
    name?: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsUUID('4', { each: true })
    participantIds: string[];

    @IsUUID()
    @IsOptional()
    neighborhoodId?: string;
}
