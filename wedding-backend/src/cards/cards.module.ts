// src/cards/cards.module.ts
import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AssetsModule } from '../assets/assets.module';

import { AdminCardsController } from './admin-cards.controller';

@Module({
  imports: [PrismaModule, AssetsModule],
  controllers: [CardsController, AdminCardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule { }
