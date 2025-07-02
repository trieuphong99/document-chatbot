import express from "express";
import dotenv from "dotenv";
import uploadRoute from "./routes/upload";
import queryRoute from "./routes/query";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/upload", uploadRoute);
app.use("/query", queryRoute);

app.listen(3003, () => console.log("Backend running on http://localhost:3003"));
