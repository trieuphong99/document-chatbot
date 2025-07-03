import { Module } from "@nestjs/common";
import { RouteController } from "./route.controller";
import { RouteService } from "./route.service";
import { PineconeService } from "../vectorstore/pipecone";

@Module({
  imports: [],
  controllers: [RouteController],
  providers: [RouteService, PineconeService],
})
export class RouteModule {}
