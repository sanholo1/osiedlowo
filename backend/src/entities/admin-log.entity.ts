import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum AdminActionType {
    USER_CREATED = 'USER_CREATED',
    USER_UPDATED = 'USER_UPDATED',
    USER_DELETED = 'USER_DELETED',
    USER_BLOCKED = 'USER_BLOCKED',
    USER_UNBLOCKED = 'USER_UNBLOCKED',
    USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
    ANNOUNCEMENT_CREATED = 'ANNOUNCEMENT_CREATED',
    ANNOUNCEMENT_UPDATED = 'ANNOUNCEMENT_UPDATED',
    ANNOUNCEMENT_DELETED = 'ANNOUNCEMENT_DELETED',
    ANNOUNCEMENT_PINNED = 'ANNOUNCEMENT_PINNED',
    ANNOUNCEMENT_UNPINNED = 'ANNOUNCEMENT_UNPINNED',
    ANNOUNCEMENT_FLAGGED = 'ANNOUNCEMENT_FLAGGED',
    ANNOUNCEMENT_UNFLAGGED = 'ANNOUNCEMENT_UNFLAGGED',
    RATING_DELETED = 'RATING_DELETED',
    NEIGHBORHOOD_UPDATED = 'NEIGHBORHOOD_UPDATED',
    NEIGHBORHOOD_DELETED = 'NEIGHBORHOOD_DELETED',
    NEIGHBORHOOD_MEMBER_REMOVED = 'NEIGHBORHOOD_MEMBER_REMOVED',
    MESSAGE_DELETED = 'MESSAGE_DELETED',
    SYSTEM_ANNOUNCEMENT_CREATED = 'SYSTEM_ANNOUNCEMENT_CREATED',
    SYSTEM_ANNOUNCEMENT_UPDATED = 'SYSTEM_ANNOUNCEMENT_UPDATED',
    SYSTEM_ANNOUNCEMENT_DELETED = 'SYSTEM_ANNOUNCEMENT_DELETED'
}

export enum TargetType {
    USER = 'user',
    ANNOUNCEMENT = 'announcement',
    RATING = 'rating',
    NEIGHBORHOOD = 'neighborhood',
    MESSAGE = 'message',
    SYSTEM_ANNOUNCEMENT = 'system_announcement'
}

@Entity('admin_logs')
export class AdminLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: AdminActionType
    })
    action: AdminActionType;

    @Column({ type: 'varchar', length: 36 })
    adminId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'adminId' })
    admin: User;

    @Column({
        type: 'enum',
        enum: TargetType
    })
    targetType: TargetType;

    @Column({ type: 'varchar', length: 36, nullable: true })
    targetId: string | null;

    @Column({ type: 'json', nullable: true })
    details: object | null;

    @Column({ type: 'varchar', length: 45, nullable: true })
    ipAddress: string | null;

    @CreateDateColumn()
    createdAt: Date;
}
