import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('blocked_users')
@Unique(['userId', 'blockedUserId'])
export class BlockedUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    userId: string;

    @Column('uuid')
    blockedUserId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'blockedUserId' })
    blockedUser: User;

    @CreateDateColumn()
    createdAt: Date;
}
