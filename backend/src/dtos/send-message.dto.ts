import { IsString, IsUUID, IsNotEmpty, MaxLength } from 'class-validator';

export class SendMessageDto {
    @IsUUID()
    @IsNotEmpty()
    conversationId: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(5000)
    content: string;
}
