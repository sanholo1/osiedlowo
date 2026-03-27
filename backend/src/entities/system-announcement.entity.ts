import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum SystemAnnouncementPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

@Entity('system_announcements')
export class SystemAnnouncement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({
        type: 'enum',
        enum: SystemAnnouncementPriority,
        default: SystemAnnouncementPriority.MEDIUM
    })
    priority: SystemAnnouncementPriority;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'datetime', nullable: true })
    expiresAt: Date | null;

    @Column({ type: 'varchar', length: 36 })
    createdById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
