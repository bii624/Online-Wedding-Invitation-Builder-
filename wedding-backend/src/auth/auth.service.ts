import { UsersService } from '@/users/users.service';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { CreateUserDto } from '@/users/dto/create-user.dto';

// Helper to parse duration string to milliseconds
function parseMs(duration: string | number): number {
  if (typeof duration === 'number') return duration;
  if (!duration) return 0;
  const match = duration.match(/^(\d+)(ms|s|m|h|d|w|y)?$/);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = match[2] || 'ms';
  switch (unit) {
    case 'ms':
      return value;
    case 's':
      return value * 1000;
    case 'm':
      return value * 60000;
    case 'h':
      return value * 3600000;
    case 'd':
      return value * 86400000;
    case 'w':
      return value * 604800000;
    case 'y':
      return value * 31536000000;
    default:
      return value;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    const isValidPassword = await this.usersService.checkUserPassword(
      password,
      user?.passwordHash ?? null,
    );

    if (!user || !isValidPassword) {
      return null;
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  createRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES') ||
        '7d') as any,
    });
  }

  async login(user: any, response?: Response) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.createRefreshToken(payload);

    await this.usersService.updateUserToken(refreshToken, user.id);

    if (response) {
      response.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });
      response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: parseMs(
          this.configService.get<string>('JWT_REFRESH_EXPIRES') || '7d',
        ),
      });
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async logout(user: any, response: Response) {
    if (user && user.id) {
      await this.usersService.updateUserToken(null, user.id);
    }
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  processNewToken = async (refresh_token: string, response: Response) => {
    try {
      this.jwtService.verify(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.findUserByToken(refresh_token);
      if (user) {
        // update refreshToken
        const { id, fullName, email, role } = user;
        const payload = {
          sub: id,
          email,
          role,
          fullName,
          avatarUrl: user.avatarUrl,
        };
        const refreshToken = this.createRefreshToken(payload);

        await this.usersService.updateUserToken(refreshToken, id);

        // set refreshToken as cookie
        response.clearCookie('refresh_token');
        response.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: parseMs(
            this.configService.get<string>('JWT_REFRESH_EXPIRES') || '7d',
          ),
        });

        return {
          accessToken: this.jwtService.sign(payload),
          refreshToken,
          user: {
            id,
            fullName,
            email,
            role,
            avatarUrl: user.avatarUrl,
          },
        };
      } else {
        throw new BadRequestException(
          'Refresh token khong hop le. Vui long login',
        );
      }
    } catch (e) {
      throw new BadRequestException(
        'Refresh token khong hop le. Vui long login',
      );
    }
  };

  // =====================================================================

  // ĐĂNG NHẬP MẠNG XÃ HỘI (GOOGLE & FACEBOOK) - ĐĂNG KÝ / ĐĂNG NHẬP OAUTH
  // =====================================================================
  async findOrCreateOAuthUser(profile: any) {
    return this.usersService.findOrCreateOAuthUser(profile);
  }
}
