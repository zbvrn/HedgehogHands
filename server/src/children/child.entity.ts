import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('children')
export class Child {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'int' })
  age!: number;

  @Column({ type: 'text', nullable: true })
  features?: string | null;

  @Column({ type: 'int', name: 'parent_id' })
  parentId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

