import {  NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Student } from '../models/students';
import mongoose from "mongoose";

export const authenticateAdmin = (req: any, res: any, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, "SECRET_KEY") as any;
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

export const authenticateStudent = async (
  req: any,
  res: any,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, "SECRET_KEY") as any;
    if (
      !decoded.studentId ||
      !mongoose.Types.ObjectId.isValid(decoded.studentId)
    ) {
      return res.status(400).json({ message: "Invalid studentId in token" });
    }

    const student = await Student.findById(decoded.studentId);
    if (!student) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.student = student;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};
