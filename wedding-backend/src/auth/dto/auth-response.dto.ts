// =====================================================================
// ĐỊNH DẠNG PHẢN HỒI API CHO SWAGGER (AUTH DTO RESPONSES)
// =====================================================================

import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/users/entities/user.entity';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT Access Token dùng để xác thực cho các yêu cầu tiếp theo',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkM2IwNzM4NC1kMTEzLTRlYzUtYTU4Ny0zNTNkOThjMzg1YzciLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImZ1bGxOYW1lIjoiTmd1eWVuIFZhbiBBIn0.signature',
  })
  accessToken!: string;

  @ApiProperty({
    description:
      'JWT Refresh Token dùng để lấy lại Access Token mới khi hết hạn',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkM2IwNzM4NC1kMTEzLTRlYzUtYTU4Ny0zNTNkOThjMzg1YzciLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImZ1bGxOYW1lIjoiTmd1eWVuIFZhbiBBIn0.signature_refresh',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Thông tin tài khoản người dùng',
    type: () => User,
  })
  user!: User;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Thông điệp phản hồi sau khi đăng xuất thành công',
    example: 'Logged out successfully',
  })
  message!: string;
}

export class ProfileResponseDto {
  @ApiProperty({
    description: 'ID của tài khoản người dùng',
    example: 'd3b07384-d113-4ec5-a587-353d98c385c7',
  })
  id!: string;

  @ApiProperty({
    description: 'Email đăng nhập của tài khoản',
    example: 'user@example.com',
  })
  email!: string | null;

  @ApiProperty({
    description: 'Vai trò người dùng trong hệ thống (user, admin)',
    example: 'user',
  })
  role!: string;

  @ApiProperty({
    description: 'Tên đầy đủ của người dùng',
    example: 'Nguyen Van A',
  })
  fullName!: string | null;
}
