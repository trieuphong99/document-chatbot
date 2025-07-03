import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { configDotenv } from "dotenv";

import cors from "cors";
import { AppModule } from "./app.module";

configDotenv();

const createApp = async () => {
  const adapter = new ExpressAdapter();
  adapter.set("trust proxy", 1);

  const app = await NestFactory.create(AppModule, adapter);

  app.use(cors());  
  
  return app;
};

const bootstrap = async () => {
  const app = await createApp();
  await app.listen(3003);
  console.log(`Application is running on: ${await app.getUrl()}`);
};
bootstrap();