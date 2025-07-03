"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = require("@langchain/openai");
const pinecone_1 = require("@langchain/pinecone");
const pipecone_1 = require("../vectorstore/pipecone");
const runnables_1 = require("@langchain/core/runnables");
const prompts_1 = require("@langchain/core/prompts");
const queryRouter = express_1.default.Router();
queryRouter.get("/", async (req, res) => {
    try {
        const question = req.query.q;
        if (!question)
            return res.status(400).send("Missing query param ?q=");
        const embeddings = new openai_1.OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
        const vectorStore = await pinecone_1.PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex: pipecone_1.pineconeIndex,
            textKey: "text",
        });
        const retriever = vectorStore.asRetriever();
        const model = new openai_1.ChatOpenAI({
            modelName: "gpt-4",
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.7,
        });
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful assistant answering based on context."],
            ["human", "Context:\n{context}\n\nQuestion:\n{question}"],
        ]);
        const chain = runnables_1.RunnableSequence.from([
            async (input) => {
                const docs = await retriever.invoke(input.question);
                const context = docs.map((doc) => doc.pageContent).join("\n\n");
                return { question: input.question, context };
            },
            prompt,
            model,
        ]);
        const result = await chain.invoke({ question });
        res.json({ question, answer: result.content });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Query failed" });
    }
});
exports.default = queryRouter;
