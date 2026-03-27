import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Announcement } from './announcement.entity';

@Entity('ratings')
export class Rating {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    fromUserId: string;

    @Column('uuid')
    toUserId: string;

    @Column('uuid')
    announcementId: string;

    @Column('int')
    stars: number;

    @Column('text', { nullable: true })
    comment: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'fromUserId' })
    fromUser: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'toUserId' })
    toUser: User;

    @ManyToOne(() => Announcement)
    @JoinColumn({ name: 'announcementId' })
    announcement: Announcement;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
