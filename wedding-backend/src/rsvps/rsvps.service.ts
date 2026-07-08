// src/rsvps/rsvps.service.ts
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RsvpsService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // PUBLIC — không yêu cầu đăng nhập
  // =========================================================================

  /**
   * Gửi xác nhận tham dự (RSVP) từ trang thiệp công khai.
   * Hỗ trợ submit cả Nhà trai và Nhà gái trong cùng 1 request bằng cách
   * truyền mảng `entries` hoặc các trường riêng lẻ.
   */
  async submitRsvp(cardId: string, data: any) {
    const card = await this.prisma.card.findUnique({ where: { id: cardId } });
    if (!card) throw new NotFoundException('Không tìm thấy thiệp cưới');

    // Hỗ trợ submit nhiều RSVP một lúc (Nhà trai + Nhà gái)
    if (Array.isArray(data.entries)) {
      const records = await Promise.all(
        data.entries.map((entry: any) =>
          this.prisma.rsvpResponse.create({
            data: {
              cardId,
              guestName: entry.guestName ?? data.guestName,
              phone: entry.phone ?? data.phone,
              side: entry.side,
              attending: entry.attending,
              numAttendees: entry.numAttendees || 1,
              note: entry.note,
            },
          }),
        ),
      );
      return records;
    }

    // Single RSVP entry (backward compatible)
    return this.prisma.rsvpResponse.create({
      data: {
        cardId,
        guestName: data.guestName,
        phone: data.phone,
        side: data.side,
        attending: data.attending,
        numAttendees: data.numAttendees || 1,
        note: data.note,
      },
    });
  }

  // =========================================================================
  // PRIVATE — yêu cầu đăng nhập (chủ sở hữu thiệp)
  // =========================================================================

  /**
   * Lấy toàn bộ danh sách RSVP của tất cả thiệp thuộc user.
   */
  async getAllRsvps(userId: string) {
    return this.prisma.rsvpResponse.findMany({
      where: { card: { userId } },
      include: {
        card: { select: { title: true } },
        guest: { select: { side: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Lấy danh sách RSVP của một thiệp cụ thể.
   */
  async getRsvpsByCard(cardId: string, userId: string) {
    const card = await this.prisma.card.findUnique({ where: { id: cardId } });
    if (!card) throw new NotFoundException('Không tìm thấy thiệp');

    return this.prisma.rsvpResponse.findMany({
      where: { cardId, card: { userId } },
      include: {
        guest: { select: { side: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
