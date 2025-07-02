import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { extractText } from "../utils/extract";
import { pineconeIndex } from "../vectorstore/pipecone";
import { OpenAIEmbeddings } from "@langchain/openai";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = req.file!;
    const filePath = path.resolve(file.path);
    const text = await extractText(filePath, file.mimetype);

    const embedding = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const vectors = await embedding.embedQuery(text);

    const vector = {
      id: `${file.filename}`,
      values: vectors,
      metadata: {
        filename: file.originalname,
        text: text.slice(0, 300),
      },
    };

    await pineconeIndex.upsert([vector]);
    fs.unlinkSync(filePath);

    res.json({
      status: "uploaded",
      filename: file.originalname,
      vectorId: vector.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
