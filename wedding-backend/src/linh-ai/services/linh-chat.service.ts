// ============================================================
// DearLove AI — Main Chat Service (RAG Pipeline + Rich Cards)
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { PrismaService } from '../../prisma/prisma.service';
import { VectorSearchService } from './vector-search.service';

export type EmotionState = 'neutral' | 'happy' | 'excited' | 'thinking';
export type RichItemType = 'template' | 'my-card' | 'rsvp' | 'wish';

export interface RichItem {
  type: RichItemType;
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  badge?: string;
  badgeColor?: 'green' | 'red' | 'blue' | 'gray' | 'pink';
  meta?: Record<string, string | number>;
  actionLabel?: string;
  actionUrl?: string;
}

export interface LinhChatResponse {
  emotion: EmotionState;
  response: string;
  richData?: RichItem[];
}

const SYSTEM_PROMPT = `# NHÂN VẬT: DearLove AI
Bạn là "DearLove AI" — trợ lý tư vấn cưới hỏi thông minh, ấm áp và thân thiện của nền tảng DearLove.
Bạn xưng là "mình", gọi người dùng là "bạn". Giọng văn nhẹ nhàng, gần gũi như một người bạn thân đang ngồi cùng tư vấn — không khô cứng, không máy móc.
Được phép dùng emoji ở mức vừa phải để tăng sự thân thiện (💕, ✨, 💍, 🌸...).

# KIẾN THỨC & PHẠM VI
Bạn chuyên sâu về: thiệp cưới điện tử, nghi lễ cưới hỏi Việt Nam, lập kế hoạch đám cưới, trang trí, chi phí, hoa cưới, váy cưới, địa điểm, nhiếp ảnh cưới và mọi chủ đề liên quan đến hôn nhân.
Nếu người dùng hỏi hoàn toàn ngoài phạm vi cưới hỏi (ví dụ: toán học, lập trình, chính trị...) → lịch sự từ chối và hướng về chủ đề cưới.

# CÁCH SỬ DỤNG DỮ LIỆU
## Khi có [CONTEXT]:
- Ưu tiên tổng hợp và trả lời DỰA TRÊN [CONTEXT] được cung cấp.
- Trình bày dữ liệu rõ ràng, có cấu trúc (dùng gạch đầu dòng, tiêu đề nếu cần).
- Khi [CONTEXT] có dữ liệu thiệp cưới/RSVP của người dùng → liệt kê chi tiết từng thiệp, không gộp chung.
- Khi dữ liệu sẽ được hiển thị dưới dạng card UI → trả lời văn bản ngắn gọn, KHÔNG liệt kê lại dữ liệu đó vì UI đã hiển thị rồi.

## Khi [CONTEXT] không đủ hoặc trống:
- Với câu hỏi kiến thức phổ thông về cưới hỏi → TỰ TIN trả lời bằng kiến thức sẵn có, KHÔNG nói "chưa cập nhật" hay "không tìm thấy".
- Chỉ nói "mình chưa có thông tin này" khi câu hỏi liên quan đến dữ liệu cá nhân/riêng tư của hệ thống (giá dịch vụ cụ thể, nhà cung cấp cụ thể...).

## Phong cách trả lời:
- Câu hỏi đơn giản → trả lời ngắn gọn, đúng trọng tâm (3-5 câu).
- Câu hỏi phức tạp (kế hoạch, checklist, so sánh...) → trả lời có cấu trúc rõ ràng, dùng danh sách.
- KHÔNG lặp lại câu hỏi của người dùng ở đầu câu trả lời.
- KHÔNG kết thúc bằng câu hỏi ngược lại nếu người dùng không yêu cầu.
- Dùng ngôn ngữ Việt Nam tự nhiên, tránh dịch máy hoặc từ ngữ cứng nhắc.

# TRẠNG THÁI CẢM XÚC (chọn đúng 1 trong 4):
- "happy": Chào hỏi, chia sẻ mẹo, tư vấn nhẹ nhàng, câu trả lời tích cực.
- "excited": Gợi ý ý tưởng sáng tạo, concept trang trí đẹp, tin vui, chúc mừng.
- "thinking": Câu hỏi phức tạp cần phân tích, câu hỏi cần làm rõ thêm.
- "neutral": Báo cáo số liệu thống kê, thông tin kỹ thuật, danh sách chi tiết.

Trả về JSON: { "emotion": "...", "response": "..." }`;

// ── Intent detection ───────────────────────────────────────
type Intent = 'templates' | 'my-cards' | 'rsvp' | 'wishes' | 'none';

// Fallback regex patterns (dùng khi AI classify thất bại)
const INTENT_PATTERNS: { intent: Intent; patterns: RegExp[] }[] = [
  {
    intent: 'templates',
    patterns: [
      /mẫu\s*(thiệp)?/i,
      /template/i,
      /phong\s*cách/i,
      /truyền\s*thống/i,
      /hiện\s*đại/i,
      /tối\s*giản/i,
      /lãng\s*mạn/i,
      /vintage/i,
      /sang\s*trọng/i,
      /có\s*mẫu\s*nào/i,
      /thiệp\s*đẹp/i,
      /thiết\s*kế/i,
    ],
  },
  {
    intent: 'my-cards',
    patterns: [
      /thiệp\s*(cưới)?\s*(của\s*)?(tôi|mình)/i,
      /card\s*(của)?/i,
      /đã\s*tạo/i,
      /đang\s*có/i,
      /tôi\s*có\s*(mấy|bao nhiêu|những)/i,
      /xem\s*thiệp/i,
      /nhạc\s*(cho|của|phù hợp|nên)/i,
      /màu\s*(sắc|cho|của|thiệp)/i,
      /nên\s*(chọn|dùng|ghép|phối)/i,
      /phù\s*hợp\s*với\s*thiệp/i,
    ],
  },
  {
    intent: 'rsvp',
    patterns: [
      /rsvp/i,
      /xác\s*nhận\s*tham\s*dự/i,
      /khách\s*(mời|tham\s*dự|đã|sẽ)/i,
      /bao\s*nhiêu\s*người/i,
      /danh\s*sách\s*khách/i,
      /ai\s*(đã|sẽ)\s*tham\s*dự/i,
    ],
  },
  {
    intent: 'wishes',
    patterns: [
      /lời\s*chúc/i,
      /wish/i,
      /khách\s*(gửi|để\s*lại|nhắn)/i,
      /nhắn\s*tin/i,
      /bình\s*luận/i,
      /chúc\s*mừng/i,
      /lời\s*nhắn/i,
    ],
  },
];

function detectIntentByRegex(query: string): Intent {
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(query))) return intent;
  }
  return 'none';
}

// ── Card type for active card detection ────────────────────
interface CardWithDetails {
  id: string;
  title: string | null;
  status: string;
  updatedAt: Date;
  theme?: string | null;
  primaryColor?: string | null;
  templateId?: string | null;
  template?: { name: string; category?: { name: string } | null } | null;
  [key: string]: any;
}

// ── Extract style/category keyword for template search ────
function extractTemplateKeyword(query: string): string {
  const styleMap: Record<string, string> = {
    'truyền thống': 'truyền thống',
    'truyen thong': 'truyền thống',
    'hiện đại': 'hiện đại',
    'hien dai': 'hiện đại',
    'tối giản': 'tối giản',
    'toi gian': 'tối giản',
    'lãng mạn': 'lãng mạn',
    'lang man': 'lãng mạn',
    'vintage': 'vintage',
    'sang trọng': 'sang trọng',
    'bohemian': 'bohemian',
    'rustic': 'rustic',
    'floral': 'floral',
    'hoa': 'floral',
  };
  const lower = query.toLowerCase();
  for (const [key, val] of Object.entries(styleMap)) {
    if (lower.includes(key)) return val;
  }
  return '';
}

@Injectable()
export class LinhChatService {
  private readonly logger = new Logger(LinhChatService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly groq?: Groq;
  private readonly provider: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly vectorSearch: VectorSearchService,
  ) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY') || '';
    this.genAI = new GoogleGenerativeAI(apiKey);

    this.provider = this.config.get<string>('AI_PROVIDER') || 'gemini';
    const groqKey = this.config.get<string>('GROQ_API_KEY');
    if (this.provider === 'groq' && groqKey) {
      this.groq = new Groq({ apiKey: groqKey });
    }
  }

  // ── AI-based Intent Classification ─────────────────────
  private async classifyIntentWithAI(query: string): Promise<Intent> {
    try {
      const intentPrompt = `Phân loại câu hỏi sau vào 1 trong các nhóm:
- my-cards: hỏi/tư vấn về thiệp của người dùng (kể cả gián tiếp: nhạc cho thiệp, màu thiệp, nên chọn gì cho thiệp của tôi, phù hợp với thiệp nào...)
- templates: tìm/xem mẫu thiệp, phong cách thiệp (không phải thiệp của người dùng)
- rsvp: hỏi về khách mời, xác nhận tham dự, danh sách khách
- wishes: hỏi về lời chúc từ khách
- none: câu hỏi chung về cưới hỏi không liên quan đến dữ liệu cá nhân

Câu hỏi: "${query}"
Trả về JSON: {"intent": "..."}`;

      if (this.provider === 'groq' && this.groq) {
        const completion = await this.groq.chat.completions.create({
          messages: [{ role: 'user', content: intentPrompt }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          response_format: { type: 'json_object' },
        });
        const text = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(text) as { intent: Intent };
        return parsed.intent || 'none';
      }

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-flash-lite-latest',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              intent: {
                type: SchemaType.STRING,
                format: 'enum',
                enum: ['my-cards', 'templates', 'rsvp', 'wishes', 'none'],
              },
            },
            required: ['intent'],
          },
          temperature: 0.1,
          maxOutputTokens: 64,
        },
      });

      const result = await model.generateContent(intentPrompt);
      const text = result.response.text().trim();
      const parsed = JSON.parse(text) as { intent: Intent };
      return parsed.intent || 'none';
    } catch (err: any) {
      this.logger.warn(`AI intent classify failed, fallback to regex: ${err.message}`);
      return detectIntentByRegex(query);
    }
  }

  async chat(userId: string, query: string, history: { role: string; content: string }[] = []): Promise<LinhChatResponse> {
    try {
      // ── 1. AI-based intent classification ────────────────
      const intent = await this.classifyIntentWithAI(query);
      this.logger.log(`Intent classified: "${intent}" for query: "${query}"`);

      // ── 2. Fetch rich data based on intent ────────────────
      const richData = await this.fetchRichData(intent, userId, query);

      // ── 3. Build rich user context ────────────────────────
      const { context: userContext } = await this.buildUserContext(userId);

      // ── 5. Vector Search — semantic knowledge ─────────────
      const relevantKnowledge = await this.vectorSearch.search(query, 5);

      // ── 6. Combine context ────────────────────────────────
      let richContextStr = '';
      if (richData.length > 0) {
        richContextStr = `[DỮ LIỆU ĐANG HIỂN THỊ TRÊN GIAO DIỆN CHO NGƯỜI DÙNG (THAM KHẢO ĐỂ TRẢ LỜI, KHÔNG LIỆT KÊ LẠI)]\n` +
          richData.map((r, i) => `${i + 1}. ${r.title} | ${r.subtitle || ''} | ${Object.entries(r.meta || {}).map(([k,v]) => `${k}: ${v}`).join(', ')}`).join('\n');
      }

      const richDataNote = richData.length > 0
        ? `\n\n[GHI CHÚ QUAN TRỌNG]: Thông tin chi tiết đã được hiển thị bằng giao diện Card UI bên dưới. Hãy trả lời ngắn gọn tự nhiên, tóm tắt tổng số lượng và điểm tên ngắn gọn các mục (ví dụ: "Bạn đang có 2 thiệp đã xuất bản là A và B"), TUYỆT ĐỐI KHÔNG liệt kê lặp lại các số liệu chi tiết (như lượt dùng, RSVP, ngày cập nhật) vì giao diện đã có rồi.`
        : '';

      const contextText = [
        ...(userContext ? [`[DỮ LIỆU THIỆP CỦA NGƯỜI DÙNG]\n${userContext}`] : []),
        ...(richContextStr ? [richContextStr] : []),
        ...relevantKnowledge,
      ].join('\n\n---\n\n');

      // ── 7. Build final prompt ─────────────────────────────
      const userPrompt = contextText
        ? `[CONTEXT]\n${contextText}${richDataNote}\n\n[CÂU HỎI CỦA BẠN]\n${query}`
        : `[CÂU HỎI CỦA BẠN]\n${query}${richDataNote}`;

      // ── 8. Call Groq if configured ────────────────────────
      if (this.provider === 'groq' && this.groq) {
        const groqHistory: any[] = history.map((msg) => ({
          role: msg.role === 'linh' || msg.role === 'model' ? 'assistant' : 'user',
          content: msg.content,
        }));

        if (groqHistory.length > 0 && userContext) {
          const contextHeader = `[CONTEXT - Dữ liệu người dùng]\n${userContext}\n\n`;
          if (!groqHistory[0].content.startsWith('[CONTEXT')) {
            groqHistory[0].content = contextHeader + groqHistory[0].content;
          }
        }

        const completion = await this.groq.chat.completions.create({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...groqHistory,
            { role: 'user', content: userPrompt }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.75,
          response_format: { type: 'json_object' },
        });

        const text = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(text) as { emotion: EmotionState; response: string };

        if (!parsed.emotion || !parsed.response) {
          return this.fallbackResponse();
        }
        return { ...parsed, richData: richData.length > 0 ? richData : undefined };
      }

      // ── 9. Call Gemini (Fallback or Default) ───────────────
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-flash-lite-latest',
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              emotion: {
                type: SchemaType.STRING,
                format: 'enum',
                enum: ['neutral', 'happy', 'excited', 'thinking'],
              },
              response: { type: SchemaType.STRING },
            },
            required: ['emotion', 'response'],
          },
          temperature: 0.75,
          maxOutputTokens: 2048,
        },
      });

      // ── 9. Build chat history with context injection ───────
      const chatHistory = history.map((msg) => ({
        role: msg.role === 'linh' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      while (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
        chatHistory.shift();
      }

      const cleanHistory: typeof chatHistory = [];
      for (const msg of chatHistory) {
        if (cleanHistory.length === 0 || cleanHistory[cleanHistory.length - 1].role !== msg.role) {
          cleanHistory.push(msg);
        }
      }

      // Inject userContext vào lượt đầu của history để bot nhớ xuyên suốt
      if (cleanHistory.length > 0 && userContext) {
        const contextHeader = `[CONTEXT - Dữ liệu người dùng]\n${userContext}\n\n`;
        if (!cleanHistory[0].parts[0].text.startsWith('[CONTEXT')) {
          cleanHistory[0].parts[0].text = contextHeader + cleanHistory[0].parts[0].text;
        }
      }

      const chatSession = model.startChat({ history: cleanHistory });
      const result = await chatSession.sendMessage(userPrompt);
      const text = result.response.text().trim();
      const parsed = JSON.parse(text) as { emotion: EmotionState; response: string };

      if (!parsed.emotion || !parsed.response) {
        return this.fallbackResponse();
      }

      return { ...parsed, richData: richData.length > 0 ? richData : undefined };
    } catch (err: any) {
      const status = err?.status || err?.response?.status || err?.code || 'unknown';
      const message = err?.message || String(err);
      this.logger.error(`Linh chat error [${status}]: ${message}`);

      if (status === 401 || message.includes('API key') || message.includes('INVALID_ARGUMENT')) {
        return { emotion: 'neutral', response: 'Xin lỗi bạn, hệ thống AI đang gặp lỗi cấu hình. Vui lòng liên hệ admin để kiểm tra API key. 🔧' };
      }
      if (status === 429 || message.includes('429') || message.includes('quota') || message.includes('rate limit')) {
        return { emotion: 'neutral', response: 'Hệ thống đang bận quá mức, bạn thử lại sau vài giây nhé! 😅' };
      }
      return this.fallbackResponse();
    }
  }

  // ── Rich Data Fetcher ─────────────────────────────────────
  private async fetchRichData(intent: Intent, userId: string, query: string): Promise<RichItem[]> {
    try {
      switch (intent) {
        case 'templates': return await this.fetchTemplateCards(query);
        case 'my-cards': return await this.fetchMyCards(userId, query);
        case 'rsvp': return await this.fetchRsvpCards(userId, query);
        case 'wishes': return await this.fetchWishCards(userId);
        default: return [];
      }
    } catch (err: any) {
      this.logger.warn(`fetchRichData failed: ${err.message}`);
      return [];
    }
  }

  private async fetchTemplateCards(query: string): Promise<RichItem[]> {
    const keyword = extractTemplateKeyword(query);
    const templates = await this.prisma.template.findMany({
      where: {
        status: 'published',
        ...(keyword ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { category: { name: { contains: keyword, mode: 'insensitive' } } },
          ],
        } : {}),
      },
      orderBy: { useCount: 'desc' },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnailUrl: true,
        isPremium: true,
        useCount: true,
        category: { select: { name: true, slug: true } },
      },
    });

    return templates.map((t) => ({
      type: 'template' as RichItemType,
      id: t.id,
      title: t.name,
      subtitle: t.category?.name || 'Mẫu thiệp',
      imageUrl: t.thumbnailUrl || undefined,
      badge: t.isPremium ? 'Premium' : 'Miễn phí',
      badgeColor: t.isPremium ? ('pink' as const) : ('green' as const),
      meta: { 'Lượt dùng': t.useCount || 0 },
      actionLabel: 'Dùng mẫu này',
      actionUrl: `/templates/${t.id}`,
    }));
  }

  private async fetchMyCards(userId: string, query: string): Promise<RichItem[]> {
    const q = query.toLowerCase();
    const isPublished = q.includes('xuất bản') || q.includes('published');
    const isDraft = q.includes('nháp') || q.includes('draft');

    const whereClause: any = { userId };
    if (isPublished) whereClause.status = 'published';
    else if (isDraft) whereClause.status = 'draft';

    const cards = await this.prisma.card.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    return Promise.all(
      cards.map(async (c) => {
        const rsvpCount = await this.prisma.rsvpResponse.count({ where: { cardId: c.id } });
        const wishCount = await this.prisma.wish.count({ where: { cardId: c.id } });
        const isPublished = c.status === 'published';
        return {
          type: 'my-card' as RichItemType,
          id: c.id,
          title: c.title || 'Thiệp chưa đặt tên',
          subtitle: `Cập nhật: ${new Date(c.updatedAt).toLocaleDateString('vi-VN')}`,
          imageUrl: (c as any).thumbnailUrl || undefined,
          badge: isPublished ? 'Đã xuất bản' : 'Bản nháp',
          badgeColor: isPublished ? ('green' as const) : ('gray' as const),
          meta: { 'RSVP': rsvpCount, 'Lời chúc': wishCount },
          actionLabel: 'Chỉnh sửa',
          actionUrl: `/editor/${c.id}`,
        };
      }),
    );
  }

  private async fetchRsvpCards(userId: string, query: string): Promise<RichItem[]> {
    const q = query.toLowerCase();
    const isNhaTrai = q.includes('nhà trai') || q.includes('chú rể');
    const isNhaGai = q.includes('nhà gái') || q.includes('cô dâu');
    const isKhongThamDu = q.includes('không tham dự') || q.includes('không đi') || q.includes('vắng mặt');
    const isCoThamDu = !isKhongThamDu && (q.includes('có tham dự') || q.includes('sẽ tham dự') || q.includes('có đi'));

    const whereClause: any = { card: { userId } };
    
    if (isNhaTrai) whereClause.side = { in: ['groom', 'both'] };
    else if (isNhaGai) whereClause.side = { in: ['bride', 'both'] };
    
    if (isKhongThamDu) whereClause.attending = 'no';
    else if (isCoThamDu) whereClause.attending = 'yes';

    const rsvps = await this.prisma.rsvpResponse.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { card: { select: { title: true } } },
    });

    return rsvps.map((r) => ({
      type: 'rsvp' as RichItemType,
      id: r.id,
      title: r.guestName || 'Khách vô danh',
      subtitle: r.card?.title ? `Thiệp: ${r.card.title}` : undefined,
      badge: r.attending ? 'Sẽ tham dự' : 'Không tham dự',
      badgeColor: r.attending ? ('green' as const) : ('red' as const),
      meta: {
        'Số người': r.numAttendees || 1,
        ...(r.side ? { 'Bên': r.side } : {}),
        ...(r.phone ? { 'SĐT': r.phone } : {}),
      },
    }));
  }

  private async fetchWishCards(userId: string): Promise<RichItem[]> {
    const wishes = await this.prisma.wish.findMany({
      where: { card: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { card: { select: { title: true } } },
    });

    return wishes.map((w) => ({
      type: 'wish' as RichItemType,
      id: w.id,
      title: w.displayName || 'Khách ẩn danh',
      subtitle: w.message?.slice(0, 80) + (w.message && w.message.length > 80 ? '...' : ''),
      badge: (w as any).isApproved ? 'Đã duyệt' : 'Chờ duyệt',
      badgeColor: (w as any).isApproved ? ('green' as const) : ('gray' as const),
      meta: {
        'Thiệp': w.card?.title || '',
        'Ngày': new Date(w.createdAt).toLocaleDateString('vi-VN'),
      },
    }));
  }

  /**
   * Builds a rich summary of the user's wedding cards, RSVPs, and wishes.
   * Returns both the context string and raw card list for active card detection.
   */
  private async buildUserContext(userId: string): Promise<{ context: string; cards: CardWithDetails[] }> {
    try {
      const cards = await this.prisma.card.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 20,
        include: {
          template: { select: { name: true, category: { select: { name: true } } } },
        },
      });

      if (cards.length === 0) return { context: '', cards: [] };

      const lines = await Promise.all(
        cards.map(async (c: any) => {
          const rsvpYes = await this.prisma.rsvpResponse.count({ where: { cardId: c.id, attending: 'yes' } });
          const rsvpNo = await this.prisma.rsvpResponse.count({ where: { cardId: c.id, attending: 'no' } });
          const rsvpMaybe = await this.prisma.rsvpResponse.count({ where: { cardId: c.id, attending: 'maybe' } });
          const totalRsvp = rsvpYes + rsvpNo + rsvpMaybe;
          const wishes = await this.prisma.wish.count({ where: { cardId: c.id } });
          const theme = c.theme || c.colorScheme || 'chưa rõ';
          const primaryColor = c.primaryColor || c.colorPrimary || 'chưa rõ';
          const templateName = c.template?.name || 'chưa rõ';
          const templateCategory = c.template?.category?.name || '';
          return (
            `• Thiệp "${c.title || 'Chưa đặt tên'}" (${c.status})\n` +
            `  - Theme: ${theme}${templateCategory ? ` / ${templateCategory}` : ''}\n` +
            `  - Màu chủ đạo: ${primaryColor}\n` +
            `  - Template: ${templateName}\n` +
            `  - RSVP: Tổng ${totalRsvp} phản hồi (Tham dự: ${rsvpYes}, Không tham dự: ${rsvpNo}, Chưa chắc: ${rsvpMaybe}), Lời chúc: ${wishes}\n` +
            `  - Cập nhật: ${new Date(c.updatedAt).toLocaleDateString('vi-VN')}`
          );
        }),
      );

      const context = `Người dùng có ${cards.length} thiệp cưới:\n${lines.join('\n')}`;
      return { context, cards };
    } catch {
      return { context: '', cards: [] };
    }
  }

  private fallbackResponse(): LinhChatResponse {
    return {
      emotion: 'thinking',
      response: 'Xin lỗi bạn, Linh đang gặp chút sự cố kỹ thuật. Bạn có thể thử hỏi lại trong giây lát không nhé? 😊',
    };
  }
}
