import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();
const pinecone = new Pinecone();
export const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME);
