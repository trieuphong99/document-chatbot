"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const extract_1 = require("../utils/extract");
const pipecone_1 = require("../vectorstore/pipecone");
const openai_1 = require("@langchain/openai");
const uploadRouter = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: "uploads/" });
uploadRouter.post("/", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        const filePath = path_1.default.resolve(file.path);
        const text = await (0, extract_1.extractText)(filePath, file.mimetype);
        const embedding = new openai_1.OpenAIEmbeddings({
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
        await pipecone_1.pineconeIndex.upsert([vector]);
        fs_1.default.unlinkSync(filePath);
        res.json({
            status: "uploaded",
            filename: file.originalname,
            vectorId: vector.id,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
});
exports.default = uploadRouter;
