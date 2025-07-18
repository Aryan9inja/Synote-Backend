import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { limitter } from "./constant.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: limitter }));
app.use(cookieParser());

// import routes
import userRouter from "./routes/user.routes.js";
import notesRouter from "./routes/notes.routes.js";
import tasksRouter from "./routes/tasks.routes.js";
import subtaskRouter from "./routes/subtask.routes.js";
import aiRouter from "./routes/ai.routes.js";

// routes declaration
app.get("/api/v1/ping", (_, res) => {
  return res.status(200).json({
    success: true,
    message: "Pong! Server is running",
  });
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/notes", notesRouter);
app.use("/api/v1/tasks", tasksRouter);
app.use("/api/v1/tasks/:id/subtask", subtaskRouter);
app.use("/api/v1/ai", aiRouter);

//Error handling
app.use(errorHandler);

export { app };
