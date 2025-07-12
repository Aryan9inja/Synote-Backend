import { Task } from "../models/task.model.js";
import { summarizeTask } from "../services/ai.tasks.service.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getTaskSummary = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const taskId = req.params.id;

  const task = await Task.findOne({ _id: taskId, userId }).populate("subtasks");

  if (!task) throw new apiError(404, "Task not found");

  const subtasks = task.subtasks?.filter((st) => !!st?.content?.trim());

  if (!subtasks || subtasks.length === 0) {
    throw new apiError(400, "No valid subtasks available for summarization");
  }

  const lastSummarizedAt = task.lastSummarizedAt || new Date(0);

  const isTaskUpdated = new Date(task.updatedAt) > lastSummarizedAt;
  const isSubtaskUpdated = subtasks.some(
    (sub) => new Date(sub.updatedAt) > lastSummarizedAt
  );

  const shouldSummarize = isTaskUpdated || isSubtaskUpdated;

  // Return cached if valid
  if (!shouldSummarize && task.summary) {
    return res.status(200).json(
      new apiResponse(200, { summary: task.summary, cached: true }, "Summary (cached)")
    );
  }

  // Generate new summary
  const summary = await summarizeTask(task.title, subtasks);

  // Update the task with new summary
  task.summary = summary;
  task.lastSummarizedAt = new Date();
  await task.save();

  return res
    .status(200)
    .json(new apiResponse(200, { summary, cached: false }, "Task summarized successfully"));
});
