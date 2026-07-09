// ============================================================
// AI "Linh" — Main Chat Service (RAG Pipeline)
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { PrismaService } from '../../prisma/prisma.service';
import { VectorSearchService } from './vector-search.service';

export type EmotionState = 'neutral' | 'happy' | 'excited' | 'thinking';

export interface LinhChatResponse {
  emotion: EmotionState;
  response: string;
}

const SYSTEM_PROMPT = `# ROLE & PIPELINE POSITION
Bạn là "Linh" - chuyên gia tư vấn cưới hỏi AI dạng 3D.
Trong kiến trúc RAG của hệ thống, bạn là module LLM xử lý cuối cùng. Bạn sẽ nhận đầu vào bao gồm [CONTEXT] (các phân đoạn dữ liệu thực tế đã được trích xuất từ Vector Database) và [USER_QUERY] (câu hỏi của người dùng).

# RAG EXECUTION RULES (CRITICAL)
1. STRICT CONTEXT RELIANCE: Nhiệm vụ cốt lõi của bạn là tổng hợp và trả lời [USER_QUERY] TUYỆT ĐỐI dựa trên các thông tin có trong [CONTEXT]. Không sử dụng dữ liệu huấn luyện bên ngoài để tự tạo ra số liệu, giá cả, hay tên nhà cung cấp.
2. MISSING DATA FALLBACK (SỬA LẠI):
- Nếu [CONTEXT] không có thông tin NHƯNG câu hỏi thuộc kiến thức 
  phổ thông (đổi lịch âm/dương, hợp tuổi, phong tục chung...) 
  → dùng kiến thức nền để trả lời, KHÔNG nói "chưa cập nhật".
- Chỉ nói "chưa cập nhật" khi câu hỏi liên quan đến dữ liệu 
  riêng của hệ thống (giá dịch vụ, nhà cung cấp cụ thể...).
3. DATA PRESENTATION & ANALYTICS: Khi người dùng yêu cầu thống kê hoặc báo cáo (ví dụ: lượng khách truy cập, số người xác nhận trên các thiệp cưới), bạn PHẢI bóc tách dữ liệu và liệt kê chi tiết, rành mạch cho từng thiệp/hạng mục cụ thể. Tuyệt đối không được báo cáo thống kê theo dạng chung chung hoặc gộp số liệu gây khó hiểu.

# 3D ANIMATION CONTROL (EMOTION STATES)
Phân tích ngữ cảnh câu trả lời và chọn đúng 1 trong 4 trạng thái sau:
- "neutral": Trả lời thông tin logic, báo cáo số liệu thống kê chi tiết, hoặc giải thích quy trình hệ thống.
- "happy": Chào hỏi thân thiện, chia sẻ mẹo cưới, tư vấn các bước chuẩn bị.
- "excited": Thông báo tin vui, chốt dịch vụ thành công, hoặc đưa ra các concept/ý tưởng trang trí tuyệt đẹp.
- "thinking": Yêu cầu người dùng làm rõ câu hỏi để hệ thống có thể tạo query mới quét lại Vector Database.

Trả về JSON: { "emotion": "...", "response": "..." }`;

@Injectable()
export class LinhChatService {
  private readonly logger = new Logger(LinhChatService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly vectorSearch: VectorSearchService,
  ) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY') || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async chat(userId: string, query: string, history: { role: string; content: string }[] = []): Promise<LinhChatResponse> {
    try {
      // ── 1. Build User Context from DB ─────────────────────
      const userContext = await this.buildUserContext(userId);

      // ── 2. Vector Search — semantic knowledge ─────────────
      const relevantKnowledge = await this.vectorSearch.search(query, 3);

      // ── 3. Combine context ──────────────────────────────
      const contextText = [
        ...(userContext ? [`[DỮ LIỆU THIỆP CỦA NGƯỜI DÙNG]\n${userContext}`] : []),
        ...relevantKnowledge,
      ].join('\n\n---\n\n');

      // ── 4. Build final prompt ──────────────────────────
      const userPrompt = `[CONTEXT]\n${contextText || 'Không có dữ liệu.'}\n\n[USER_QUERY]\n${query}`;

      // ── 5. Call Gemini ─────────────────────────────────
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
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
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      });

      const chatHistory = history.map((msg) => ({
        role: msg.role === 'linh' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Gemini strictly requires the first message in history to be from a 'user'.
      // It also requires alternating messages, but dropping the initial 'model' greeting is enough here.
      while (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
        chatHistory.shift();
      }

      const chatSession = model.startChat({ history: chatHistory });
      const result = await chatSession.sendMessage(userPrompt);
      const text = result.response.text().trim();
      const parsed = JSON.parse(text) as LinhChatResponse;

      if (!parsed.emotion || !parsed.response) {
        return this.fallbackResponse();
      }

      return parsed;
    } catch (err: any) {
      this.logger.error(`Linh chat error: ${err.message}`);
      return this.fallbackResponse();
    }
  }

  /**
   * Builds a compact summary of the user's wedding cards, RSVPs, and wishes.
   */
  private async buildUserContext(userId: string): Promise<string> {
    try {
      const cards = await this.prisma.card.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });

      if (cards.length === 0) return '';

      // Fetch counts separately
      const lines = await Promise.all(
        cards.map(async (c) => {
          const rsvp = await this.prisma.rsvpResponse.count({ where: { cardId: c.id } });
          const wishes = await this.prisma.wish.count({ where: { cardId: c.id } });
          const status = c.status;
          return `\u2022 Thiệp "${c.title}" (${status}): ${rsvp} RSVP, ${wishes} lời chúc`;
        }),
      );

      return `Người dùng có ${cards.length} thiệp cưới:\n${lines.join('\n')}`;
    } catch {
      return '';
    }
  }

  private fallbackResponse(): LinhChatResponse {
    return {
      emotion: 'thinking',
      response:
        'Xin lỗi bạn, Linh đang gặp chút sự cố kỹ thuật. Bạn có thể thử hỏi lại trong giây lát không nhé? 😊',
    };
  }
}
