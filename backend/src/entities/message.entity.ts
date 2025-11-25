import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from './user.entity';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    conversationId: string;

    @Column()
    senderId: string;

    @Column('text')
    content: string;

    @Column({
        type: 'json',
        nullable: true
    })
    readBy: string[]; // Array of user IDs who read the message

    @ManyToOne(() => Conversation, conversation => conversation.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversationId' })
    conversation: Conversation;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'senderId' })
    sender: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    toJSON(): any {
        return {
            id: this.id,
            conversationId: this.conversationId,
            senderId: this.senderId,
            content: this.content,
            readBy: this.readBy || [],
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            sender: this.sender
        };
    }
}
