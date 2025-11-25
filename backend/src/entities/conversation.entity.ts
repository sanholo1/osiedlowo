import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Message } from './message.entity';
import { ConversationParticipant } from './conversation-participant.entity';

export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group'
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.PRIVATE
  })
  type: ConversationType;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  neighborhoodId: string;

  @OneToMany(() => Message, message => message.conversation, { cascade: true })
  messages: Message[];

  @OneToMany(() => ConversationParticipant, participant => participant.conversation, { cascade: true })
  participants: ConversationParticipant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
