import cors from "cors";
import express, { type Express } from "express";
import { errorHandler } from "./middleware/errorHandler";
import { clogsRouter } from "./routes/clogs";
import { healthRouter } from "./routes/health";
import { llmRouter } from "./routes/llm";
import { searchRouter } from "./routes/search";

export const app: Express = express();

app.use(cors());
app.use(express.json());
app.use("/health", healthRouter);
app.use("/clogs", clogsRouter);
app.use("/llm", llmRouter);
app.use("/search", searchRouter);

// This should be last
app.use(errorHandler);
