import mongoose from "mongoose";

const formFieldSchema = new mongoose.Schema(
  {
    fieldName: { type: String, required: true },
    fieldType: { type: String, required: true },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    questionType: { type: String, enum: ["mcq", "truefalse", "short"], required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    positiveMarks: { type: Number, default: 1 },
    negativeMarks: { type: Number, default: 0 },
  },
  { _id: true }
);

const settingsSchema = new mongoose.Schema(
  {
    timeLimitMinutes: { type: Number, required: true },
    maxTabSwitches: { type: Number, default: 3 },
    passingPercentage: { type: Number, default: 40 },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    formFields: [formFieldSchema],
    questions: [questionSchema],
    settings: settingsSchema,
    quizLink: { type: String, required: true, unique: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
