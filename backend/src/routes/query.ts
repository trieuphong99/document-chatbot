import express, { Request, Response } from "express";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { pineconeIndex } from "../vectorstore/pipecone";
import { RunnableSequence } from "@langchain/core/runnables";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const question = req.query.q as string;
    if (!question) return res.status(400).send("Missing query param ?q=");

    // Initialize embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize vector store
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      textKey: "text",
    });

    // Initialize chat model (replaces OpenAIChat)
    const model = new ChatOpenAI({
      modelName: "gpt-4",
      openAIApiKey: process.env.OPENAI_API_KEY!,
      temperature: 0.7,
    });

    // Create retrieval chain
    const retriever = vectorStore.asRetriever();
    const chain = RunnableSequence.from([
      (input) => ({ query: input }),
      retriever,
      (docs) => model.invoke(docs),
    ]);

    const result = await chain.invoke({ query: question });

    res.json({ question, answer: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed" });
  }
});

export default router;
