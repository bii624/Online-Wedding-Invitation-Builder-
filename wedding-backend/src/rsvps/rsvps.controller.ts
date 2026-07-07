// src/rsvps/rsvps.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RsvpsService } from './rsvps.service';

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags('RSVPs')
@Controller('rsvps')
export class RsvpsController {
  constructor(private readonly rsvpsService: RsvpsService) {}

  // ==========================================================================
  // ROUTE PUBLIC — không cần JwtAuthGuard
  // ==========================================================================

  @Post('public/:cardId')
  @ApiOperation({ summary: 'Gửi phản hồi tham dự (RSVP) công khai' })
  submitRsvp(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() data: any,
  ) {
    return this.rsvpsService.submitRsvp(cardId, data);
  }

  // ==========================================================================
  // ROUTES PRIVATE — bắt buộc đăng nhập
  // ==========================================================================

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách RSVP của user' })
  getAllRsvps(@Req() req: AuthRequest) {
    return this.rsvpsService.getAllRsvps(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('card/:cardId')
  @ApiOperation({ summary: 'Lấy danh sách RSVP của một thiệp cụ thể' })
  getRsvpsByCard(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Req() req: AuthRequest,
  ) {
    return this.rsvpsService.getRsvpsByCard(cardId, req.user.id);
  }
}
