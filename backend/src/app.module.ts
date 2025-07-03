import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RouteModule } from "./routes/route.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // make available to every module
      envFilePath: ".env",
    }),
    RouteModule,
  ],
  controllers: [],
  providers: [],
  exports: [ConfigModule],
})
export class AppModule {}
