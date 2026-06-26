import { UsersService } from '@/users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { CreateUserDto } from '@/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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

  async login(user: any, response?: Response) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = this.jwtService.sign(payload);

    if (response) {
      response.cookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  logout(response: Response) {
    response.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }
}
