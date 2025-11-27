import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selectedAnswer: { type: String },
    isCorrect: { type: Boolean, required: true },
    marksAwarded: { type: Number, required: true },
  },
  { _id: false }
);

const violationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    studentFormData: { type: Object, required: true },
    answers: [answerSchema],
    violations: [violationSchema],
    totalScore: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    status: { type: String, enum: ["completed", "terminated"], required: true },
    timeTaken: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
