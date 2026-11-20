import { Router } from "express";
import authenticate from "../../middlewares/authenticate.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import * as controller from "./parentReport.controller.js";
import { generateReportSchema, reportMonthQuerySchema, reportParamsSchema, studentReportParamsSchema } from "./parentReport.validation.js";

const router = Router();
router.use(authenticate);
router.get("/students/:studentId/parent-reports/preview", validate(studentReportParamsSchema, "params"), validate(reportMonthQuerySchema, "query"), controller.previewReport);
router.get("/students/:studentId/parent-reports", validate(studentReportParamsSchema, "params"), controller.listHistory);
router.post("/students/:studentId/parent-reports", validate(studentReportParamsSchema, "params"), validate(generateReportSchema), controller.generateReport);
router.get("/parent-reports/:id", validate(reportParamsSchema, "params"), controller.getSnapshot);
router.get("/parent-reports/:id/download", validate(reportParamsSchema, "params"), controller.getDownloadUrl);

export default router;

