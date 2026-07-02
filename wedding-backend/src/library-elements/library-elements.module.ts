// src/library-elements/library-elements.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LibraryElementsService } from './library-elements.service';
import { AdminLibraryElementsController } from './admin-library-elements.controller';
import { LibraryElementsController } from './library-elements.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryProvider } from '../assets/cloudinary.provider';

@Module({
    imports: [ConfigModule, PrismaModule],
    controllers: [AdminLibraryElementsController, LibraryElementsController],
    providers: [LibraryElementsService, CloudinaryProvider],
    exports: [LibraryElementsService],
})
export class LibraryElementsModule { }
