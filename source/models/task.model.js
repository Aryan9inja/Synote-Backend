import mongoose, { Schema } from "mongoose";
import { Subtask } from "./subtask.model.js";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    summary: {
      type: String,
    },
    lastSummarizedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.virtual("subtasks", {
  ref: "Subtask",
  localField: "_id",
  foreignField: "taskId",
});

taskSchema.set("toObject", { virtuals: true });
taskSchema.set("toJSON", { virtuals: true });

taskSchema.pre("deleteOne", async function (next) {
  const taskId = this.getQuery()._id;
  await Subtask.deleteMany({ taskId });
  next();
});

export const Task = mongoose.model("Task", taskSchema);
