import mongoose, { Schema } from "mongoose";

const ResumeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    fileName: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    extractedData: {
      textLength: Number,
      pageCount: Number,
    },

    atsScore: Number,
    grade: String,
    summary: String,
    details: {
      lengthScore: Number,
      keywordScore: Number,
      structureScore: Number,
    },

    validationIssues: [String],
    missingSkills: [String],
    suggestions: [String],
    interviewQuestions: [String],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Resume ||
  mongoose.model("Resume", ResumeSchema);