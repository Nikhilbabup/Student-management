import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { Student } from "../models/students";
import { Task } from "../models/task";
import { authenticateAdmin } from "../middleware/auth";
import mongoose from "mongoose";

const router = Router();

// Predefined admin credentials
const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "admin";

// Admin login
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  (req: any, res: any) => {
    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ role: "admin" }, "SECRET_KEY", {
        expiresIn: "1h",
      });
      return res.json({ message: "Login successful", token });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  }
);

// Add a new student
router.post(
  "/add-student",
  authenticateAdmin,
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("department").notEmpty(),
    body("password").isLength({ min: 6 }),
  ],
  async (req: any, res: any) => {
    const { name, email, department, password } = req.body;
    const studentDetails = await Student.findOne({ email: email });
    if (studentDetails) {
      return res
        .status(400)
        .json({ message: "Student with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({
      name,
      email,
      department,
      password: hashedPassword,
    });
    await student.save();
    res.json({ message: "Student added successfully" });
  }
);

// Assign task to a student
router.post(
  "/assign-task",
  authenticateAdmin,
  [
    body("studentId").isNumeric(),
    body("title").notEmpty(),
    body("description").notEmpty(),
    body("dueDate").isISO8601(),
  ],
  async (req: any, res: any) => {
    const { studentId, title, description, dueDate } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const task = new Task({
      title,
      description,
      status: "pending",
      dueDate: new Date(dueDate),
    });

    // Save the task
    const savedTask = await task.save();

    // Add the task to the student's task list
    student.tasks.push(savedTask._id as mongoose.Types.ObjectId);
    await student.save();

    res.json({ message: "Task assigned successfully", task });
  }
);

export default router;
