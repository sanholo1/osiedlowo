import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Announcement } from './announcement.entity';

@Entity('announcement_responses')
export class AnnouncementResponse {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 36 })
    announcementId: string;

    @ManyToOne(() => Announcement, announcement => announcement.responses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'announcementId' })
    announcement: Announcement;

    @Column({ type: 'varchar', length: 36 })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'text', nullable: true })
    message: string;

    @Column({ type: 'boolean', default: false })
    isAccepted: boolean;

    @CreateDateColumn()
    createdAt: Date;
}

