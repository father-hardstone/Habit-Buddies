import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { GroupMember } from '../groups/entities/group-member.entity';
import { Group } from '../groups/entities/group.entity';
import { Habit } from '../habits/entities/habit.entity';
import { ConversationParticipant } from '../chats/entities/conversation-participant.entity';
import { Message } from '../chats/entities/message.entity';
import { PasswordReset } from '../auth/entities/password-reset.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PasswordReset, (reset) => reset.user)
  passwordResets: PasswordReset[];

  @OneToMany(() => Group, (group) => group.admin)
  administeredGroups: Group[];

  @OneToMany(() => GroupMember, (membership) => membership.user)
  groupMemberships: GroupMember[];

  @OneToMany(() => Habit, (habit) => habit.createdBy)
  habits: Habit[];

  @OneToMany(() => ConversationParticipant, (participant) => participant.user)
  conversationParticipants: ConversationParticipant[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];
}
