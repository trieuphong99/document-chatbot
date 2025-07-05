import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DocumentModule } from "./modules/document.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // make available to every module
      envFilePath: ".env",
    }),
    DocumentModule,
  ],
  controllers: [],
  providers: [],
  exports: [ConfigModule],
})
export class AppModule {}
