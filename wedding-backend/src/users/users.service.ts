import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateCurrentPlanId(
    currentPlanId: string | null | undefined,
  ): Promise<string | null> {
    if (!currentPlanId) {
      return null;
    }

    const normalizedPlanId = currentPlanId.trim();
    if (!normalizedPlanId) {
      return null;
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: normalizedPlanId },
    });

    if (!plan) {
      throw new BadRequestException(
        `Invalid currentPlanId: plan ${normalizedPlanId} not found`,
      );
    }

    return normalizedPlanId;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, email, phone, currentPlanId, ...rest } = createUserDto;

    // Check for unique email
    if (email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check for unique phone
    if (phone) {
      const existingUser = await this.prisma.user.findUnique({
        where: { phone },
      });
      if (existingUser) {
        throw new ConflictException('Phone number already exists');
      }
    }

    let passwordHash: string | null = null;
    if (password) {
      const salt = await bcrypt.genSalt();
      passwordHash = await bcrypt.hash(password, salt);
    }

    const normalizedCurrentPlanId =
      await this.validateCurrentPlanId(currentPlanId);

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        email: email || null,
        phone: phone || null,
        passwordHash,
        currentPlanId: normalizedCurrentPlanId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        currentPlanId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return new User(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => new User(user));
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return new User(user);
  }
  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }
    return new User(user);
  }

  async checkUserPassword(password: string, hash: string | null) {
    if (!hash) {
      return false;
    }
    return bcrypt.compareSync(password, hash);
  }
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Ensure user exists
    await this.findOne(id);

    const { password, email, phone, currentPlanId, ...rest } = updateUserDto;

    // Check unique email if changing
    if (email) {
      const existingUser = await this.prisma.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check unique phone if changing
    if (phone) {
      const existingUser = await this.prisma.user.findFirst({
        where: { phone, NOT: { id } },
      });
      if (existingUser) {
        throw new ConflictException('Phone number already exists');
      }
    }

    const dataToUpdate: any = { ...rest };
    if (email !== undefined) dataToUpdate.email = email || null;
    if (phone !== undefined) dataToUpdate.phone = phone || null;
    if (currentPlanId !== undefined) {
      dataToUpdate.currentPlanId =
        await this.validateCurrentPlanId(currentPlanId);
    }

    if (password) {
      const salt = await bcrypt.genSalt();
      dataToUpdate.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return new User(updatedUser);
  }

  async remove(id: string): Promise<User> {
    // Ensure user exists
    await this.findOne(id);

    const deletedUser = await this.prisma.user.delete({ where: { id } });
    return new User(deletedUser);
  }
}
