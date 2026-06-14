import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../modules/users/services/users.service';
import type { JwtPayload } from '../../modules/auth/types/jwt-payload.interface';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return true;
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET') ?? 'dev-secret',
      });

      if (payload.guest) {
        request.user = {
          id: payload.sub,
          role: 'guest',
          email: payload.email,
          name: 'Guest',
          status: 'guest',
        };
        return true;
      }

      const user = await this.usersService.findById(payload.sub);
      if (user) {
        request.user = this.usersService.toSafeUser(user);
      }
    } catch {
      request.user = undefined;
    }

    return true;
  }
}
