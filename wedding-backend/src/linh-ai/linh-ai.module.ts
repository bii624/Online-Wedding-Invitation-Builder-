// ============================================================
// AI "Linh" — Module
// ============================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { LinhAIController } from './linh-ai.controller';
import { LinhChatService } from './services/linh-chat.service';
import { VectorSearchService } from './services/vector-search.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [LinhAIController],
  providers: [LinhChatService, VectorSearchService],
})
export class LinhAIModule {}
