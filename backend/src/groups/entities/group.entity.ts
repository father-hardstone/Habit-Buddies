import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { GroupMember } from './group-member.entity';
import { GroupTag } from './group-tag.entity';
import { Habit } from '../../habits/entities/habit.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  aiHint: string | null;

  @Column({ type: 'uuid' })
  adminId: string;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ type: 'uuid', unique: true, nullable: true })
  inviteToken: string | null;

  @ManyToOne(() => User, (user) => user.administeredGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];

  @OneToMany(() => GroupTag, (tag) => tag.group)
  tags: GroupTag[];

  @OneToMany(() => Habit, (habit) => habit.group)
  habits: Habit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
