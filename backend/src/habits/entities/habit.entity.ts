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
import { Group } from '../../groups/entities/group.entity';
import { HabitLog } from './habit-log.entity';

@Entity('habits')
export class Habit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  groupId: string;

  @Column({ type: 'uuid', nullable: true })
  createdById: string | null;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  icon: string | null;

  @Column({ type: 'int', default: 1 })
  goal: number;

  @Column({ type: 'int', default: 0 })
  completed: number;

  @Column({ type: 'int', default: 0 })
  streak: number;

  @Column()
  color: string;

  @Column({ default: false })
  allowMultipleLogsPerDay: boolean;

  @Column({ type: 'int', default: 1 })
  dailyLogLimit: number;

  @ManyToOne(() => Group, (group) => group.habits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @ManyToOne(() => User, (user) => user.habits, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'createdById' })
  createdBy: User | null;

  @OneToMany(() => HabitLog, (log) => log.habit)
  logs: HabitLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
