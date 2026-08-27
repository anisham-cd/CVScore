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

  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Resume ||
  mongoose.model("Resume", ResumeSchema);