import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../users/user.entity';

type AuthRequestUser = {
  role?: string;
};

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const handlerRoles =
      (Reflect.getMetadata(ROLES_KEY, context.getHandler()) as
        | UserRole[]
        | undefined) ?? null;
    const classRoles =
      (Reflect.getMetadata(ROLES_KEY, context.getClass()) as
        | UserRole[]
        | undefined) ?? null;
    const allowedRoles = handlerRoles ?? classRoles ?? [];

    if (!allowedRoles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthRequestUser }>();
    const role = request.user?.role;
    if (!role) {
      return false;
    }

    const normalizedRole = role.trim().toLowerCase() as UserRole;
    return allowedRoles.includes(normalizedRole);
  }
}

