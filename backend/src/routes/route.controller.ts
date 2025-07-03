import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { RouteService } from "./route.service";
import { diskStorage } from "multer";
import * as path from "path";
@Controller("")
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post("/upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    })
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.routeService.uploadFile(file);
  }

  @Get("/query")
  async handleQuery(@Query("q") question: string) {
    if (!question) {
      return "Missing query param ?q=";
    }

    try {
      const answer = await this.routeService.query(question);
      return { question, answer };
    } catch (error) {
      console.error(error);
      return { error: "Query failed" };
    }
  }

  @Post("priority")
  async setPriority(@Body("name") name: string, @Body("score") score: number) {
    if (!name || score == null) {
      return { error: "Missing name or score in request body" };
    }
    try {
      await this.routeService.setPriority(name, score);
      return { name, score };
    } catch (error) {
      console.error(error);
      return { error: "Failed to set priority" };
    }
  }
}
