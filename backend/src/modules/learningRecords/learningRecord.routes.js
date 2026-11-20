import { Router } from "express";
import authenticate from "../../middlewares/authenticate.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import * as controller from "./learningRecord.controller.js";
import { learningRecordIdSchema, learningRecordListQuerySchema, learningRecordScheduleIdSchema, recordLessonSchema, updateLearningRecordSchema } from "./learningRecord.validation.js";

const router = Router();
router.use(authenticate);
router.get("/", validate(learningRecordListQuerySchema, "query"), controller.listRecords);
router.post("/schedules/:scheduleId", validate(learningRecordScheduleIdSchema, "params"), validate(recordLessonSchema), controller.createFromSchedule);
router.get("/:id", validate(learningRecordIdSchema, "params"), controller.getRecord);
router.patch("/:id", validate(learningRecordIdSchema, "params"), validate(updateLearningRecordSchema), controller.updateRecord);

export default router;

