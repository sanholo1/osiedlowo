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
    @IsUUID('all', { each: true })
    participantIds: string[];

    @IsUUID('all')
    @IsOptional()
    neighborhoodId?: string;
}
