import { Router } from "express";
import authenticate from "../../middlewares/authenticate.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { createStudentSchema, updateStudentSchema, studentIdSchema, studentListQuerySchema } from "./student.validation.js";
import * as controller from "./student.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", validate(studentListQuerySchema, "query"), controller.listStudents);
router.post("/", validate(createStudentSchema), controller.createStudent);
router.get("/:id", validate(studentIdSchema, "params"), controller.getStudent);
router.patch("/:id", validate(studentIdSchema, "params"), validate(updateStudentSchema), controller.updateStudent);
router.post("/:id/archive", validate(studentIdSchema, "params"), controller.archiveStudent);
router.post("/:id/restore", validate(studentIdSchema, "params"), controller.restoreStudent);

export default router;

