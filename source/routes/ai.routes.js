import { Router } from "express";
import { getNoteSummary } from "../controllers/ai.notes.controller.js";
import { getTaskSummary } from "../controllers/ai.tasks.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//secured routes
router.route("/notes/:noteId/summarize").post(verifyJWT, getNoteSummary);
router.route("/tasks/:id/summarize").get(verifyJWT, getTaskSummary);

export default router;
