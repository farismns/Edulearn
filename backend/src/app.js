import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import errorHandler from "./middlewares/errorHandler.middleware.js";
import notFound from "./middlewares/notFound.middleware.js";
import csrfProtection from "./middlewares/csrf.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import studentRoutes from "./modules/students/student.routes.js";
import subjectRoutes from "./modules/subjects/subject.routes.js";
import scheduleRoutes from "./modules/schedules/schedule.routes.js";
import learningRecordRoutes from "./modules/learningRecords/learningRecord.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import parentReportRoutes from "./modules/parentReports/parentReport.routes.js";
import settingsRoutes from "./modules/settings/settings.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// Parse incoming JSON requests
app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection);

// Basic health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Edulearn API is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/learning-records", learningRecordRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", parentReportRoutes);
app.use("/api/settings", settingsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
