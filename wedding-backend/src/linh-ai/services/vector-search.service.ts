// ============================================================
// AI "Linh" — Vector Search Service (In-Memory Cosine Similarity)
// Nhúng text thành vector và tìm kiếm ngữ nghĩa
// ============================================================

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { WEDDING_KNOWLEDGE } from '../knowledge/wedding-knowledge';

interface VectorDocument {
  id: string;
  content: string;
  topic: string;
  embedding: number[];
}

@Injectable()
export class VectorSearchService implements OnModuleInit {
  private readonly logger = new Logger(VectorSearchService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly embeddingModel;
  private vectorStore: VectorDocument[] = [];

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY') || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: 'gemini-embedding-2',
    });
  }

  async onModuleInit() {
    // Run in background so it doesn't block server startup
    this.indexWeddingKnowledge()
      .then(() => {
        this.logger.log(`Vector store initialized with ${this.vectorStore.length} documents`);
      })
      .catch((err: any) => {
        this.logger.error(`Failed to initialize vector store: ${err.message}`);
      });
  }

  /**
   * Index all wedding knowledge documents into the in-memory vector store.
   */
  private async indexWeddingKnowledge() {
    for (const item of WEDDING_KNOWLEDGE) {
      let success = false;
      let retries = 0;
      while (!success && retries < 5) {
        try {
          const embedding = await this.embed(item.content);
          this.vectorStore.push({
            id: item.topic,
            content: item.content,
            topic: item.topic,
            embedding,
          });
          success = true;
        } catch (err: any) {
          if (err.message && err.message.includes('429')) {
            this.logger.warn(`Rate limit hit. Retrying in 15 seconds...`);
            await new Promise((resolve) => setTimeout(resolve, 15000));
            retries++;
          } else {
            throw err;
          }
        }
      }
      // Sleep for 1.5 seconds between items to stay well below 100 RPM
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  /**
   * Add a dynamic document (e.g., user's card data) to the vector store.
   */
  async addDocument(id: string, topic: string, content: string) {
    // Remove existing doc with same id to avoid duplicates
    this.vectorStore = this.vectorStore.filter((d) => d.id !== id);
    const embedding = await this.embed(content);
    this.vectorStore.push({ id, topic, content, embedding });
  }

  /**
   * Find top-K most relevant documents for a given query.
   */
  async search(query: string, topK = 4): Promise<string[]> {
    if (this.vectorStore.length === 0) return [];

    let queryEmbedding: number[];
    try {
      queryEmbedding = await this.embed(query);
    } catch {
      // Fallback: return first K documents if embedding fails
      return this.vectorStore.slice(0, topK).map((d) => `[${d.topic}]\n${d.content}`);
    }

    const scored = this.vectorStore.map((doc) => ({
      ...doc,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((d) => `[${d.topic}]\n${d.content}`);
  }

  private async embed(text: string): Promise<number[]> {
    const result = await this.embeddingModel.embedContent(text);
    return result.embedding.values;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
