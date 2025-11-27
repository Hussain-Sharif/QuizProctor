import express from "express";
import { nanoid } from "nanoid";
import Quiz from "../models/Quiz.js";
import Submission from "../models/Submission.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.post("/", async (req, res) => {
  try {
    const { title, description, formFields, questions, settings, isPublished } = req.body;

    if (!title || !settings || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Title, settings and at least one question are required" });
    }

    const quizLink = nanoid(10);

    const quiz = await Quiz.create({
      teacherId: req.user._id,
      title,
      description,
      formFields: formFields || [],
      questions,
      settings,
      quizLink,
      isPublished: !!isPublished,
    });

    return res.status(201).json(quiz);
  } catch (err) {
    console.error("Create quiz error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacherId: req.user._id }).sort({ createdAt: -1 });
    return res.json(quizzes);
  } catch (err) {
    console.error("List quizzes error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    return res.json(quiz);
  } catch (err) {
    console.error("Get quiz error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user._id, isPublished: false },
      req.body,
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found or already published" });
    }

    return res.json(quiz);
  } catch (err) {
    console.error("Update quiz error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, teacherId: req.user._id, isPublished: false });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found or already published" });
    }

    return res.json({ message: "Quiz deleted" });
  } catch (err) {
    console.error("Delete quiz error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/submissions", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const submissions = await Submission.find({ quizId: quiz._id }).sort({ submittedAt: -1 });

    return res.json(submissions);
  } catch (err) {
    console.error("Get submissions error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
