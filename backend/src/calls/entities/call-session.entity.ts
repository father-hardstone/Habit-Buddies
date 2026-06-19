import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Conversation } from '../../chats/entities/conversation.entity';
import { User } from '../../users/user.entity';

export type CallMode = 'audio' | 'video';

export type CallStatus =
  | 'ringing'
  | 'ongoing'
  | 'ended'
  | 'missed'
  | 'declined';

@Entity('call_sessions')
@Index(['conversationId', 'createdAt'])
export class CallSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  conversationId: string;

  @Column({ type: 'uuid' })
  initiatorId: string;

  @Column({ type: 'varchar', length: 16 })
  mode: CallMode;

  @Column({ type: 'varchar', length: 16, default: 'ringing' })
  status: CallStatus;

  @Column({ type: 'varchar', length: 128 })
  dailyRoomName: string;

  @Column({ type: 'text' })
  dailyRoomUrl: string;

  @Column({ type: 'timestamptz', nullable: true })
  answeredAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  durationSeconds: number | null;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'initiatorId' })
  initiator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
