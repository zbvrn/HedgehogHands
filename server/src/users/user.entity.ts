import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  PARENT = 'parent',
  HELPER = 'helper',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'text' })
  email!: string;

  @Column({ type: 'text', name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'text', default: UserRole.PARENT })
  role!: UserRole;

  @Column({ type: 'text' })
  name!: string;
}
