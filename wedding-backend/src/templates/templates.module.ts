import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { AdminTemplatesController } from './admin-templates.controller';
import { AssetsModule } from '../assets/assets.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AssetsModule, PrismaModule],
  controllers: [TemplatesController, AdminTemplatesController],
  providers: [TemplatesService],
})
export class TemplatesModule {}
