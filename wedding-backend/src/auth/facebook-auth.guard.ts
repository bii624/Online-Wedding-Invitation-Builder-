// =====================================================================
// CHỨC NĂNG ĐĂNG NHẬP BẰNG FACEBOOK - FACEBOOK AUTH GUARD
// =====================================================================

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  constructor() {
    super({
      scope: ['email'],
    });
  }
}
