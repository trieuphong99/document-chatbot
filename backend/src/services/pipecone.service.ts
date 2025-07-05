import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pinecone, Index } from "@pinecone-database/pinecone";

@Injectable()
export class PineconeService implements OnModuleInit {
  private pinecone!: Pinecone;
  private index!: Index;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const apiKey = this.configService.get<string>("PINECONE_API_KEY");
    const indexName = this.configService.get<string>("PINECONE_INDEX_NAME");

    if (!apiKey) throw new Error("❌ Missing PINECONE_API_KEY in .env");
    if (!indexName) throw new Error("❌ Missing PINECONE_INDEX_NAME in .env");

    this.pinecone = new Pinecone({ apiKey });
    this.index = this.pinecone.index(indexName);
  }

  getIndex(): Index {
    if (!this.index) throw new Error("Pinecone index is not initialized");
    return this.index;
  }
}
