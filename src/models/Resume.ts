import mongoose, { Schema } from "mongoose";

const ResumeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    fileName: String,

    content: String,

    extractedData: {
      type: Object,
    },

    atsScore: Number,

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