// =====================================================================
// CHỨC NĂNG ĐĂNG NHẬP BẰNG FACEBOOK - FACEBOOK PASSPORT STRATEGY
// =====================================================================

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || 'dummy-app-id',
      clientSecret:
        configService.get<string>('FACEBOOK_APP_SECRET') || 'dummy-app-secret',
      callbackURL:
        configService.get<string>('FACEBOOK_CALLBACK_URL') ||
        'http://localhost:8000/auth/facebook/callback',
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'displayName', 'emails', 'name', 'photos'],
      graphAPIVersion: 'v18.0',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    const user = {
      email: emails && emails[0]?.value ? emails[0].value : null,
      fullName:
        `${name?.familyName || ''} ${name?.givenName || ''}`.trim() ||
        profile.displayName,
      avatarUrl: photos && photos[0]?.value ? photos[0].value : null,
      providerId: id,
      authProvider: 'facebook',
    };
    done(null, user);
  }
}
