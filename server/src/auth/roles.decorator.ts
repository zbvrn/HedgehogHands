import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/user.entity';

export const ROLES_KEY = 'roles';

const normalizeRole = (role: string): UserRole => {
  const value = role.trim().toLowerCase();
  if (value === 'admin') return UserRole.ADMIN;
  if (value === 'helper') return UserRole.HELPER;
  return UserRole.PARENT;
};

export const Roles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles.map(normalizeRole));

