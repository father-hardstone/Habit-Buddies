import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { CallMode, CallStatus } from '../../calls/entities/call-session.entity';
import { User } from '../../users/user.entity';
import { Conversation } from './conversation.entity';

@Entity('messages')
@Index(['conversationId', 'createdAt'])
@Index(['callSessionId'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  conversationId: string;

  @Column({ type: 'uuid' })
  senderId: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'varchar', length: 16, default: 'text' })
  messageType: 'text' | 'call';

  @Column({ type: 'uuid', nullable: true })
  callSessionId: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  callMode: CallMode | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  callStatus: CallStatus | null;

  @Column({ type: 'int', nullable: true })
  callDurationSeconds: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  callEndedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  replyToMessageId: string | null;

  @Column({ type: 'text', nullable: true })
  replyToText: string | null;

  @Column({ type: 'uuid', nullable: true })
  replyToSenderId: string | null;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @CreateDateColumn()
  createdAt: Date;
}
