// src/rsvps/rsvps.module.ts
import { Module } from '@nestjs/common';
import { RsvpsController } from './rsvps.controller';
import { RsvpsService } from './rsvps.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RsvpsController],
  providers: [RsvpsService],
  exports: [RsvpsService],
})
export class RsvpsModule {}
