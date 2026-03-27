import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('neighborhoods')
export class Neighborhood {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255 })
    city: string;

    @Column({ type: 'varchar', length: '36', nullable: true })
    adminId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'adminId' })
    admin: User;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'neighborhood_members',
        joinColumn: { name: 'neighborhood_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
    })
    members: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
