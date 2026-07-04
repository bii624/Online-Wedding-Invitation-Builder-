// =====================================================================
// CHỨC NĂNG ĐĂNG NHẬP BẰNG GOOGLE (GMAIL) - GOOGLE PASSPORT STRATEGY
// =====================================================================

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'dummy-client-id',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'dummy-client-secret',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:8000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    const user = {
      email: emails && emails[0]?.value ? emails[0].value : null,
      fullName: `${name?.familyName || ''} ${name?.givenName || ''}`.trim() || profile.displayName,
      avatarUrl: photos && photos[0]?.value ? photos[0].value : null,
      providerId: id,
      authProvider: 'google',
    };
    done(null, user);
  }
}
