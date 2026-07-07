import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CardsService } from './cards.service';

@ApiTags('admin/cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/cards')
export class AdminCardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thiệp (Admin)' })
  getAdminCards(@Query() query: any) {
    return this.cardsService.getAdminCards(query);
  }

  @Patch(':id/visibility')
  @ApiOperation({ summary: 'Cập nhật trạng thái công khai của thiệp' })
  updateCardVisibility(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isPublic') isPublic: boolean,
  ) {
    return this.cardsService.updateCardVisibility(id, isPublic);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thiệp (Admin)' })
  deleteAdminCard(@Param('id', ParseUUIDPipe) id: string) {
    return this.cardsService.deleteAdminCard(id);
  }
}
