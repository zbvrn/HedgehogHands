import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Announcement } from '../announcements/announcement.entity';
import { Child } from '../children/child.entity';
import { User } from '../users/user.entity';
import { RequestStatus } from './request-status.enum';

@Entity('requests')
export class RequestEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'announcement_id' })
  announcementId!: number;

  @ManyToOne(() => Announcement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'announcement_id' })
  announcement!: Announcement;

  @Column({ type: 'int', name: 'parent_id' })
  parentId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent!: User;

  @Column({ type: 'int', name: 'child_id' })
  childId!: number;

  @ManyToOne(() => Child, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'child_id' })
  child!: Child;

  @Column({ type: 'text', nullable: true })
  message?: string | null;

  @Column({ type: 'text', default: RequestStatus.NEW })
  status!: RequestStatus;

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

