import express, { Request, Response } from "express";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { pineconeIndex } from "../vectorstore/pipecone";
import { RunnableSequence } from "@langchain/core/runnables";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const queryRouter = express.Router();

queryRouter.get("/", async (req: Request, res: Response) => {
  try {
    const question = req.query.q as string;
    if (!question) return res.status(400).send("Missing query param ?q=");

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
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

    res.json({ question, answer: result.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed" });
  }
});

export default queryRouter;
