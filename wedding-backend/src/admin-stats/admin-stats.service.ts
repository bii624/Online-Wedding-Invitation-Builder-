import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminStatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - 7);

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const getDayBounds = (day: Date) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      return { gte: day, lt: nextDay };
    };

    // ── Fire ALL queries in parallel ──────────────────────────────
    const [
      totalUsers,
      previousTotalUsers,
      totalCards,
      previousTotalCards,
      totalTemplates,
      previousTotalTemplates,
      publishedCards,
      previousPublishedCards,
      topTemplates,
      recentUsers,
      recentCards,
      ...dailyCounts
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { lt: currentWeekStart } } }),
      this.prisma.card.count(),
      this.prisma.card.count({ where: { createdAt: { lt: currentWeekStart } } }),
      this.prisma.template.count(),
      this.prisma.template.count({ where: { createdAt: { lt: currentWeekStart } } }),
      this.prisma.card.count({ where: { status: 'published' } }),
      this.prisma.card.count({ where: { status: 'published', createdAt: { lt: currentWeekStart } } }),
      this.prisma.template.findMany({
        take: 5,
        orderBy: { useCount: 'desc' },
        select: { name: true, useCount: true, status: true },
      }),
      this.prisma.user.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { email: true, createdAt: true },
      }),
      this.prisma.card.findMany({
        take: 3,
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' },
        select: { title: true, createdAt: true, user: { select: { email: true } } },
      }),
      // 14 daily count queries (7 days × 2 models) – all in parallel
      ...last7Days.map(day =>
        this.prisma.user.count({ where: { createdAt: getDayBounds(day) } }),
      ),
      ...last7Days.map(day =>
        this.prisma.card.count({ where: { createdAt: getDayBounds(day) } }),
      ),
    ]);

    // Split the 14 daily counts back into two arrays
    const usersDaily = dailyCounts.slice(0, 7) as number[];
    const cardsDaily = dailyCounts.slice(7, 14) as number[];

    // ── Build response ────────────────────────────────────────────
    const calcChange = (current: number, prev: number) => {
      const added = current - prev;
      if (prev === 0) return added > 0 ? `+ ${added} mới` : '0%';
      const pct = (added / prev) * 100;
      return `${pct >= 0 ? '+' : ''} ${pct.toFixed(1)}%`;
    };

    const mockUsersData     = [10, 20, 15, 30, 25, 35, 40];
    const mockCardsData     = [50, 45, 55, 40, 35, 20, 15];
    const mockTemplatesData = [5, 10, 8, 15, 12, 25, 30];
    const mockPublishedData = [20, 18, 25, 22, 30, 28, 35];

    const stats = [
      { label: 'Tổng người dùng', value: totalUsers.toLocaleString(), change: calcChange(totalUsers, previousTotalUsers), up: totalUsers >= previousTotalUsers, color: '#f59e0b', data: mockUsersData },
      { label: 'Tổng thiệp đã tạo', value: totalCards.toLocaleString(), change: calcChange(totalCards, previousTotalCards), up: totalCards >= previousTotalCards, color: '#ef4444', data: mockCardsData },
      { label: 'Tổng số Template', value: totalTemplates.toLocaleString(), change: calcChange(totalTemplates, previousTotalTemplates), up: totalTemplates >= previousTotalTemplates, color: '#22c55e', data: mockTemplatesData },
      { label: 'Thiệp xuất bản', value: publishedCards.toLocaleString(), change: calcChange(publishedCards, previousPublishedCards), up: publishedCards >= previousPublishedCards, color: '#f59e0b', data: mockPublishedData },
    ];

    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const chartData = last7Days.map((day, i) => ({
      date: dayNames[day.getDay()],
      users: usersDaily[i],
      cards: cardsDaily[i],
    }));

    const mappedTopTemplates = topTemplates.map(t => ({
      name: t.name,
      uses: t.useCount || 0,
      status: t.status,
    }));

    const getTimeAgo = (date: Date) => {
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      if (seconds < 60) return `${seconds} giây trước`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
      return `${Math.floor(seconds / 86400)} ngày trước`;
    };

    const activities = [
      ...recentUsers.map(u => ({ type: 'user', text: `${u.email} đăng ký tài khoản mới`, time: getTimeAgo(u.createdAt), timestamp: u.createdAt.getTime() })),
      ...recentCards.map(c => ({ type: 'card', text: `Thiệp "${c.title}" vừa được xuất bản`, time: getTimeAgo(c.createdAt), timestamp: c.createdAt.getTime() })),
    ];
    activities.sort((a, b) => b.timestamp - a.timestamp);
    const activity = activities.slice(0, 5).map(a => ({ type: a.type, text: a.text, time: a.time }));

    return { stats, chartData, topTemplates: mappedTopTemplates, activity };
  }
}
