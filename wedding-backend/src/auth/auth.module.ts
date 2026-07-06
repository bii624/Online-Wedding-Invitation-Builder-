import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@/users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { GoogleStrategy } from './passport/google.strategy';
import { FacebookStrategy } from './passport/facebook.strategy';
import { AuthController } from './auth.controller';
import { MailModule } from '@/mail/mail.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresVal =
          configService.get<string>('JWT_ACCESS_EXPIRES') || '3600';
        const expiresIn = /^\d+$/.test(expiresVal)
          ? Number(expiresVal)
          : expiresVal;
        return {
          secret:
            configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ||
            'dev-secret',
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule { }
