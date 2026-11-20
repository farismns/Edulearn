import { Router } from "express";
import authenticate from "../../middlewares/authenticate.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import * as controller from "./schedule.controller.js";
import { createScheduleSchema, deleteScheduleSchema, scheduleIdSchema, scheduleListQuerySchema, updateScheduleSchema } from "./schedule.validation.js";
import { recordLessonSchema } from "../learningRecords/learningRecord.validation.js";

const router = Router();
router.use(authenticate);
router.get("/", validate(scheduleListQuerySchema, "query"), controller.listSchedules);
router.post("/", validate(createScheduleSchema), controller.createSchedule);
router.get("/:id", validate(scheduleIdSchema, "params"), controller.getSchedule);
router.patch("/:id", validate(scheduleIdSchema, "params"), validate(updateScheduleSchema), controller.updateSchedule);
router.post("/:id/cancel", validate(scheduleIdSchema, "params"), controller.cancelSchedule);
router.delete("/:id", validate(scheduleIdSchema, "params"), validate(deleteScheduleSchema), controller.deleteSchedule);
router.post("/:id/record-lesson", validate(scheduleIdSchema, "params"), validate(recordLessonSchema), controller.recordLesson);

export default router;

