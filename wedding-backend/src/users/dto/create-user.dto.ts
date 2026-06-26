import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { AuthProvider, UserRole, UserStatus } from '@prisma/client';
export class CreateUserDto {
  @ApiPropertyOptional({
    description: 'Unique email address of the user',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Unique phone number of the user',
    example: '0987654321',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description:
      'Plain text password of the user (will be hashed before saving)',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'Nguyen Van A',
  })
  @IsString()
  fullName!: string;

  @ApiPropertyOptional({
    description: 'The URL of the user avatar image',
    example: 'https://example.com/avatar.png',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'The authentication provider',
    enum: AuthProvider,
    default: AuthProvider.email,
  })
  @IsOptional()
  @IsEnum(AuthProvider)
  authProvider?: AuthProvider;

  @ApiPropertyOptional({
    description: 'The social provider ID (e.g. from Google or Facebook)',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({
    description: 'System role assigned to the user',
    enum: UserRole,
    default: UserRole.user,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Account status of the user',
    enum: UserStatus,
    default: UserStatus.unverified,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'ID of the subscription plan assigned to the user (UUID)',
    example: 'd3b07384-d113-4ec5-a587-353d98c385c7',
  })
  @IsOptional()
  @IsString()
  currentPlanId?: string;
}
