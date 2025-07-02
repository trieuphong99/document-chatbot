import dotenv from "dotenv";
dotenv.config();

import { Pinecone } from "@pinecone-database/pinecone";

// Validate required environment variables
const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME;

if (!apiKey) {
  throw new Error("❌ Missing PINECONE_API_KEY in .env");
}
if (!indexName) {
  throw new Error("❌ Missing PINECONE_INDEX_NAME in .env");
}

// Initialize Pinecone client
const pinecone = new Pinecone({ apiKey });

export const pineconeIndex = pinecone.index(indexName);
