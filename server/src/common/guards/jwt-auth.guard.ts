import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // 允许无 token 的请求通过 (用于可选认证的场景)
    if (info && info.message === 'No auth token') {
      return null;
    }
    if (err || !user) {
      throw err || new Error('未授权访问');
    }
    return user;
  }
}
