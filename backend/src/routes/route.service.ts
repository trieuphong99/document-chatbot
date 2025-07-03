import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

import { extractText } from "../utils/extract";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeService } from "../vectorstore/pipecone";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PineconeStore } from "@langchain/pinecone";
import { structureText } from "../utils/structure";

@Injectable()
export class RouteService {
  constructor(private readonly pineconeService: PineconeService) {}

  async uploadFile(file: Express.Multer.File) {
    try {
      const filePath = path.resolve(file.path);
      const rawText = await extractText(filePath, file.mimetype);

      // 2. Use LangChain + LLM to structure it into JSON
      const structured = await structureText(rawText);

      const embedding = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      });

      const vectors = await embedding.embedQuery(rawText);

      const vector = {
        id: `${file.originalname}-${+new Date()}`,
        values: vectors,
        metadata: {
          filename: file.originalname,
          title: structured.title,
          summary: structured.summary,
          keywords: structured.keywords.join(", "),
          text: rawText.slice(0, 300),
        },
      };

      const index = this.pineconeService.getIndex();
      await index.upsert([vector]);

      // 5. Save structured JSON to disk (optional)
      fs.writeFileSync(
        `structured/${file.originalname}-${+new Date()}.json`,
        JSON.stringify(structured, null, 2)
      );
      fs.unlinkSync(filePath); // Delete uploaded file after processing

      return {
        status: "uploaded",
        filename: file.originalname,
        vectorId: vector.id,
        structure: structured,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Upload failed",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async query(question: string) {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const index = this.pineconeService.getIndex();

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });

    const retriever = vectorStore.asRetriever();

    const model = new ChatOpenAI({
      modelName: "gpt-4",
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful assistant answering based on context."],
      ["human", "Context:\n{context}\n\nQuestion:\n{question}"],
    ]);

    const chain = RunnableSequence.from([
      async (input: { question: string }) => {
        const docs = await retriever.invoke(input.question);
        const context = docs.map((doc) => doc.pageContent).join("\n\n");
        return { question: input.question, context };
      },
      prompt,
      model,
    ]);

    const result = await chain.invoke({ question });

    return result.content;
  }

  async setPriority(name: string, score: number): Promise<void> {
    const index = this.pineconeService.getIndex();
    const fetchResponse = await index.fetch([name]);
    const record = fetchResponse.records?.[name];

    if (!record) {
      return;
    }

    // Update metadata
    const updatedMetadata = { ...record.metadata, priority: score };

    // Upsert the updated record
    await index.upsert([
      {
        id: name,
        values: record.values,
        metadata: updatedMetadata,
      },
    ]);
  }
}
