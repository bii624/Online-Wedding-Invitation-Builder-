// ============================================================
// AI "Linh" — Controller
// ============================================================

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LinhChatService } from './services/linh-chat.service';

class ChatDto {
  query: string;
  history?: { role: string; content: string }[];
}

@Controller('linh-ai')
export class LinhAIController {
  constructor(private readonly linhChat: LinhChatService) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async chat(@Request() req, @Body() body: ChatDto) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    return this.linhChat.chat(userId, body.query, body.history);
  }
}
