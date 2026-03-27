import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Announcement } from './announcement.entity';

@Entity('announcement_views')
export class AnnouncementView {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 36 })
    announcementId: string;

    @ManyToOne(() => Announcement, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'announcementId' })
    announcement: Announcement;

    @Column({ type: 'varchar', length: 36 })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @CreateDateColumn()
    viewedAt: Date;
}
