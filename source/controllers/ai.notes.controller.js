import { Notes } from "../models/notes.model.js";
import { summarizeNote } from "../services/ai.notes.service.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getNoteSummary = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const noteId = req.params.noteId;
  const { title, content: parsedContent } = req.body;

  const note = await Notes.findOne({ _id: noteId, userId });

  if (!note) {
    throw new apiError(404, "No note found for summarizing");
  }

  const { summary, updatedAt } = note;

  if (!parsedContent?.trim()) {
    throw new apiError(400, "Note content is empty. Cannot summarize.");
  }

  //If summary is up-to-date
  if (
    summary?.content &&
    summary.lastUpdated?.getTime() === updatedAt.getTime()
  ) {
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { summary: summary.content },
          "Summary loaded from cache"
        )
      );
  }

  //Generate new summary
  const newSummary = await summarizeNote(title, parsedContent);
  const now = new Date();

  //Set both timestamps manually
  note.summary = {
    content: newSummary,
    lastUpdated: now,
  };
  note.updatedAt = now;

  //Save without triggering auto timestamp override
  await note.save({ timestamps: false });

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { summary: newSummary },
        "Note summarized successfully"
      )
    );
});
