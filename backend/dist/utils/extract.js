"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractText = extractText;
const fs_1 = __importDefault(require("fs"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const sync_1 = require("csv-parse/sync");
async function extractText(filePath, mimetype) {
    const buffer = fs_1.default.readFileSync(filePath);
    if (mimetype === "application/pdf") {
        const data = await (0, pdf_parse_1.default)(buffer); // 📄 PDF
        return data.text;
    }
    if (mimetype === "text/plain") {
        return buffer.toString("utf8"); // 📜 TXT
    }
    if (mimetype === "text/csv") {
        const records = (0, sync_1.parse)(buffer, { columns: true }); // 📊 CSV → JSON
        return JSON.stringify(records, null, 2);
    }
    if (mimetype.startsWith("image/")) {
        const result = await tesseract_js_1.default.recognize(buffer, "eng"); // 🖼️ OCR
        return result.data.text;
    }
    return "Unsupported file";
}
