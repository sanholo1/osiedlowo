import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
    NEW_ANNOUNCEMENT = 'NEW_ANNOUNCEMENT',
    NEW_RESPONSE = 'NEW_RESPONSE',
    OFFER_ACCEPTED = 'OFFER_ACCEPTED',
    NEW_MESSAGE = 'NEW_MESSAGE',
    OFFER_RECEIVED = 'OFFER_RECEIVED'
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 36 })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({
        type: 'enum',
        enum: NotificationType
    })
    type: NotificationType;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    link: string | null;

    @Column({ type: 'varchar', length: 36, nullable: true })
    relatedId: string | null; 

    @Column({ type: 'boolean', default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
