import express from "express";
import Quiz from "../models/Quiz.js";
import Submission from "../models/Submission.js";

const router = express.Router();

router.get("/:quizLink", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizLink: req.params.quizLink, isPublished: true }).lean();
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const now = new Date();
    if (quiz.settings?.startDate && now < new Date(quiz.settings.startDate)) {
      return res.status(403).json({ message: "Quiz has not started yet" });
    }
    if (quiz.settings?.endDate && now > new Date(quiz.settings.endDate)) {
      return res.status(403).json({ message: "Quiz has ended" });
    }

    const { questions, ...quizMeta } = quiz;

    const safeQuestions = questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      positiveMarks: q.positiveMarks,
      negativeMarks: q.negativeMarks,
    }));

    return res.json({ ...quizMeta, questions: safeQuestions });
  } catch (err) {
    console.error("Get quiz by link error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/:quizLink/submit", async (req, res) => {
  try {
    const { studentFormData, answers, status, timeTaken, violations } = req.body;

    const quiz = await Quiz.findOne({ quizLink: req.params.quizLink, isPublished: true });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (!studentFormData || typeof studentFormData !== "object") {
      return res.status(400).json({ message: "studentFormData is required" });
    }

    // Prevent multiple attempts from same student (based on email if provided)
    if (studentFormData && studentFormData.email) {
      const existing = await Submission.findOne({
        quizId: quiz._id,
        "studentFormData.email": studentFormData.email,
      });
      if (existing) {
        return res.status(409).json({ message: "You have already attempted this quiz." });
      }
    }

    const questionMap = new Map();
    let maxScore = 0;
    quiz.questions.forEach((q) => {
      questionMap.set(String(q._id), q);
      maxScore += q.positiveMarks || 0;
    });

    const processedAnswers = (answers || []).map((ans) => {
      const q = questionMap.get(ans.questionId);
      if (!q) {
        return {
          questionId: ans.questionId,
          selectedAnswer: ans.selectedAnswer || "",
          isCorrect: false,
          marksAwarded: 0,
        };
      }

      const isCorrect = (ans.selectedAnswer || "") === q.correctAnswer;
      const marksAwarded = isCorrect
        ? q.positiveMarks || 0
        : q.negativeMarks
        ? -Math.abs(q.negativeMarks)
        : 0;

      return {
        questionId: String(q._id),
        selectedAnswer: ans.selectedAnswer || "",
        isCorrect,
        marksAwarded,
      };
    });

    const totalScore = processedAnswers.reduce((sum, a) => sum + a.marksAwarded, 0);

    const submission = await Submission.create({
      quizId: quiz._id,
      studentFormData,
      answers: processedAnswers,
      violations: Array.isArray(violations) ? violations : [],
      totalScore,
      maxScore,
      status: status === "terminated" ? "terminated" : "completed",
      timeTaken: typeof timeTaken === "number" ? timeTaken : 0,
    });

    const pass =
      quiz.settings?.passingPercentage != null
        ? (totalScore / maxScore) * 100 >= quiz.settings.passingPercentage
        : true;

    return res.status(201).json({
      submissionId: submission._id,
      totalScore,
      maxScore,
      pass,
      status: submission.status,
    });
  } catch (err) {
    console.error("Submit quiz error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/:quizLink/log-violation", async (req, res) => {
  try {
    const { type } = req.body;

    const quiz = await Quiz.findOne({ quizLink: req.params.quizLink, isPublished: true });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.status(200).json({ message: "Violation logged (client-side only for now)", type });
  } catch (err) {
    console.error("Log violation error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
