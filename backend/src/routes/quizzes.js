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

router.get("/:id/submissions/csv", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const submissions = await Submission.find({ quizId: quiz._id }).sort({ submittedAt: -1 }).lean();

    const rows = submissions.map((s) => {
      const studentName =
        typeof s.studentFormData === "object" && s.studentFormData
          ? s.studentFormData.name || ""
          : "";
      const studentEmail =
        typeof s.studentFormData === "object" && s.studentFormData
          ? s.studentFormData.email || ""
          : "";

      const tabSwitchCount = Array.isArray(s.violations)
        ? s.violations.filter((v) => v.type === "tab_switch").length
        : 0;

      const totalViolations = Array.isArray(s.violations) ? s.violations.length : 0;

      return {
        submissionId: String(s._id),
        studentName,
        studentEmail,
        totalScore: s.totalScore,
        maxScore: s.maxScore,
        passPercentage:
          s.maxScore && typeof s.totalScore === "number"
            ? ((s.totalScore / s.maxScore) * 100).toFixed(2)
            : "0.00",
        status: s.status,
        timeTakenSeconds: s.timeTaken,
        submittedAt: s.submittedAt ? new Date(s.submittedAt).toISOString() : "",
        tabSwitchCount,
        totalViolations,
        formDataJson:
          typeof s.studentFormData === "object" && s.studentFormData
            ? JSON.stringify(s.studentFormData)
            : "",
      };
    });

    const headers = [
      "submissionId",
      "studentName",
      "studentEmail",
      "totalScore",
      "maxScore",
      "passPercentage",
      "status",
      "timeTakenSeconds",
      "submittedAt",
      "tabSwitchCount",
      "totalViolations",
      "formDataJson",
    ];

    const escapeCsv = (value) => {
      if (value == null) return "";
      const str = String(value);
      if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const csvLines = [];
    csvLines.push(headers.join(","));
    for (const row of rows) {
      const line = headers.map((h) => escapeCsv(row[h])).join(",");
      csvLines.push(line);
    }

    const csv = csvLines.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="quiz-${quiz._id.toString()}-submissions.csv"`
    );

    return res.send(csv);
  } catch (err) {
    console.error("Get submissions CSV error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
