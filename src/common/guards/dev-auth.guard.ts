import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: any;
}

@Injectable()
export class DevAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    
    // 개발용 기본 사용자 정보 설정
    request.user = {
      id: 1,
      username: 'dev-user',
      email: 'dev@example.com',
      group_name: 'admin'
    };
    
    return true;
  }
}
