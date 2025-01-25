import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { Student } from '../models/students';
import { authenticateStudent } from '../middleware/auth';
import { validationResult } from 'express-validator';
import { Task } from '../models/task';

const router = Router();

// Student login

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const student = await Student.findOne({ email: email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, student.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ studentId: student._id }, "SECRET_KEY", {
      expiresIn: "1h",
    });
    res.json({ message: "Login successful", token });
  }
);

// Get assigned tasks
router.get("/tasks", authenticateStudent, async (req: any, res: any) => {
  const student = req.student;
  let tasklist = [];
  if (student.tasks.length > 0) {
    console.log(student.tasks);

    for (const task in student.tasks) {
      const taskDetails = await Task.findById(student.tasks[task]);

      tasklist.push(taskDetails);
    }

    res.json({ tasks: tasklist });
  } else {
    res.json({ message: "No task found" });
  }
});

// Update task status
router.patch(
  '/tasks/:taskId',
  authenticateStudent,
  async (req:any, res:any) => {
    const student = req.student;
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if(student.task.includes(taskId)){
      if (['pending', 'completed', 'overdue'].includes(status)) {
        task.status = status;
        return res.json({ message: 'Task status updated successfully', task });
      }
  
      res.status(400).json({ message: 'Invalid status' });
    }else{
      res.status(400).json({ message: 'Cannot access this task' });

    }


  }
);

export default router;
