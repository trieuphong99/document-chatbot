import { Module } from "@nestjs/common";
import { DocumentController } from "../controllers/document.controller";
import { DocumentService } from "../services/document.service";
import { PineconeService } from "../services/pipecone.service";

@Module({
  imports: [],
  controllers: [DocumentController],
  providers: [DocumentService, PineconeService],
})
export class DocumentModule {}
