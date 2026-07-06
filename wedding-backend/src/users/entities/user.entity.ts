import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  User as PrismaUser,
  UserRole,
  UserStatus,
  AuthProvider,
} from '@prisma/client';
import { Exclude } from 'class-transformer';
export class User implements PrismaUser {
  @ApiProperty({
    description: 'The unique identifier of the user (UUID)',
    example: 'd3b07384-d113-4ec5-a587-353d98c385c7',
  })
  id!: string;

  @ApiPropertyOptional({
    description: 'The unique email address of the user',
    example: 'user@example.com',
  })
  email!: string | null;

  @ApiPropertyOptional({
    description: 'The unique phone number of the user',
    example: '0987654321',
  })
  phone!: string | null;

  @Exclude()
  passwordHash!: string | null;

  @Exclude()
  refreshToken!: string | null;

  @Exclude()
  resetPasswordToken!: string | null;

  @Exclude()
  resetPasswordExpires!: Date | null;

  @ApiPropertyOptional({
    description: 'The full name of the user',
    example: 'Nguyen Van A',
  })
  fullName!: string | null;

  @ApiPropertyOptional({
    description: 'The URL of the user avatar',
    example: 'https://example.com/avatar.png',
  })
  avatarUrl!: string | null;

  @ApiProperty({
    description: 'The authentication provider',
    enum: AuthProvider,
    default: AuthProvider.email,
  })
  authProvider!: AuthProvider;

  @ApiPropertyOptional({
    description: 'The provider ID if signed in via Google/Facebook',
    example: '123456789',
  })
  providerId!: string | null;

  @ApiProperty({
    description: 'The role of the user within the system',
    enum: UserRole,
    default: UserRole.user,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'The current status of the user account',
    enum: UserStatus,
    default: UserStatus.unverified,
  })
  status!: UserStatus;

  @ApiPropertyOptional({
    description: 'The ID of the plan the user is currently subscribed to',
    example: 'd3b07384-d113-4ec5-a587-353d98c385c7',
  })
  currentPlanId!: string | null;

  @ApiProperty({
    description: 'The timestamp when the user was created',
    example: '2026-06-26T02:15:14.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The timestamp when the user was last updated',
    example: '2026-06-26T02:15:14.000Z',
  })
  updatedAt!: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
