import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Neighborhood } from './neighborhood.entity';

export enum AnnouncementType {
    HELP_REQUEST = 'HELP_REQUEST',
    HELP_OFFER = 'HELP_OFFER',
    INFO = 'INFO',
    EVENT = 'EVENT',
    LOST_FOUND = 'LOST_FOUND'
}

export enum AnnouncementStatus {
    ACTIVE = 'ACTIVE',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    EXPIRED = 'EXPIRED'
}

@Entity('announcements')
export class Announcement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({
        type: 'enum',
        enum: AnnouncementType,
        default: AnnouncementType.INFO
    })
    type: AnnouncementType;

    @Column({
        type: 'enum',
        enum: AnnouncementStatus,
        default: AnnouncementStatus.ACTIVE
    })
    status: AnnouncementStatus;

    @Column({ type: 'boolean', default: false })
    isPinned: boolean;

    @Column({ type: 'varchar', length: 36 })
    authorId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'authorId' })
    author: User;

    @Column({ type: 'varchar', length: 36 })
    neighborhoodId: string;

    @ManyToOne(() => Neighborhood)
    @JoinColumn({ name: 'neighborhoodId' })
    neighborhood: Neighborhood;

    @Column({ type: 'datetime', nullable: true })
    expiresAt: Date | null;

    @Column({ type: 'int', default: 0 })
    viewCount: number;

    @Column({ type: 'varchar', length: 36, nullable: true })
    acceptedResponseId: string | null;

    @OneToMany('AnnouncementResponse', 'announcement')
    responses: any[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

