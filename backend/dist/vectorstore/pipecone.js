"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PineconeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pinecone_1 = require("@pinecone-database/pinecone");
let PineconeService = class PineconeService {
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        const apiKey = this.configService.get("PINECONE_API_KEY");
        const indexName = this.configService.get("PINECONE_INDEX_NAME");
        if (!apiKey)
            throw new Error("❌ Missing PINECONE_API_KEY in .env");
        if (!indexName)
            throw new Error("❌ Missing PINECONE_INDEX_NAME in .env");
        this.pinecone = new pinecone_1.Pinecone({ apiKey });
        this.index = this.pinecone.index(indexName);
    }
    getIndex() {
        if (!this.index)
            throw new Error("Pinecone index is not initialized");
        return this.index;
    }
};
exports.PineconeService = PineconeService;
exports.PineconeService = PineconeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PineconeService);
