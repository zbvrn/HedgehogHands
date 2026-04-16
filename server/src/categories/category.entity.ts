import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;
}

