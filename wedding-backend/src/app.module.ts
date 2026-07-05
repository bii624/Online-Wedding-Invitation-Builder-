import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AssetsModule } from './assets/assets.module';
import { CardsModule } from './cards/cards.module';
import { TemplatesModule } from './templates/templates.module';
import { LibraryElementsModule } from './library-elements/library-elements.module';
import { AdminStatsModule } from './admin-stats/admin-stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    PrismaModule,
    AuthModule,
    AssetsModule,
    CardsModule,
    TemplatesModule,
    LibraryElementsModule,
    AdminStatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
