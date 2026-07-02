import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { FacebookAuthGuard } from './facebook-auth.guard';
import type { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import {
  LoginResponseDto,
  LogoutResponseDto,
  ProfileResponseDto,
} from './dto/auth-response.dto';
import { User } from '@/users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // =====================================================================
  // ĐĂNG NHẬP LOCAL (EMAIL + PASSWORD)
  // =====================================================================
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập bằng Email và Mật khẩu (Local Login)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com', description: 'Địa chỉ email đăng nhập' },
        password: { type: 'string', example: '123456', description: 'Mật khẩu tài khoản' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiOkResponse({
    description: 'Đăng nhập thành công, trả về access token, refresh token và thông tin user.',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Email hoặc mật khẩu không chính xác.' })
  handleLogin(@Req() req: any, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  // =====================================================================
  // LẤY THÔNG TIN HỒ SƠ CỦA USER ĐANG ĐĂNG NHẬP
  // =====================================================================
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin tài khoản người dùng hiện tại' })
  @ApiOkResponse({
    description: 'Trả về thông tin người dùng được giải mã từ JWT token.',
    type: ProfileResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Không có quyền truy cập (Token thiếu hoặc không hợp lệ).' })
  getProfile(@Req() req: Request) {
    return req.user;
  }

  // =====================================================================
  // ĐĂNG KÝ TÀI KHOẢN MỚI
  // =====================================================================
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản người dùng mới' })
  @ApiCreatedResponse({
    description: 'Tài khoản được đăng ký thành công.',
    type: User,
  })
  @ApiConflictResponse({ description: 'Email hoặc số điện thoại đã tồn tại.' })
  handleRegister(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  // =====================================================================
  // ĐĂNG XUẤT HỆ THỐNG
  // =====================================================================
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất khỏi hệ thống' })
  @ApiOkResponse({
    description: 'Đăng xuất thành công, xóa refresh token ở DB và xóa các cookie liên quan.',
    type: LogoutResponseDto,
  })
  handleLogout(@Req() req: any, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(req.user, response);
  }

  // =====================================================================
  // LẤY ACCESS TOKEN MỚI (REFRESH TOKEN ROTATION)
  // =====================================================================
  @Post('refresh')
  @ApiOperation({ summary: 'Lấy lại Access Token mới bằng Refresh Token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'eyJhbGciOi...' },
      },
    },
    required: false,
    description: 'Có thể truyền refreshToken qua body, cookie (refresh_token), hoặc header x-refresh-token.',
  })
  @ApiOkResponse({
    description: 'Cấp mới access token và refresh token thành công.',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Refresh token không hợp lệ hoặc đã hết hạn.' })
  async handleRefreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken =
      (req.cookies && req.cookies['refresh_token']) ||
      (req.body && req.body.refreshToken) ||
      req.headers['x-refresh-token'] ||
      req.headers.cookie
        ?.split(';')
        .find((c) => c.trim().startsWith('refresh_token='))
        ?.split('=')[1];

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found');
    }
    return this.authService.processNewToken(refreshToken, response);
  }

  // =====================================================================
  // CHỨC NĂNG ĐĂNG NHẬP BẰNG GOOGLE (GMAIL)
  // =====================================================================
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Đăng nhập bằng tài khoản Google (Redirect)' })
  async googleAuth() {
    // Kích hoạt luồng đăng nhập Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback xử lý đăng nhập Google' })
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    // Đăng ký hoặc tìm user OAuth Google
    const user = await this.authService.findOrCreateOAuthUser(req.user);
    // Đăng nhập, set cookie (HttpOnly, Secure, SameSite)
    await this.authService.login(user, res);
    
    // Redirect về frontend, FE sẽ tự động nhận cookie
    return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/');
  }

  // =====================================================================
  // CHỨC NĂNG ĐĂNG NHẬP BẰNG FACEBOOK
  // =====================================================================
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Đăng nhập bằng tài khoản Facebook (Redirect)' })
  async facebookAuth() {
    // Kích hoạt luồng đăng nhập Facebook
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Callback xử lý đăng nhập Facebook' })
  async facebookAuthRedirect(@Req() req: any, @Res() res: Response) {
    // Đăng ký hoặc tìm user OAuth Facebook
    const user = await this.authService.findOrCreateOAuthUser(req.user);
    // Đăng nhập, set cookie (HttpOnly, Secure, SameSite)
    await this.authService.login(user, res);
    
    // Redirect về frontend, FE sẽ tự động nhận cookie
    return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/');
  }
}
