import { Router } from "express";
import authenticate from "../../middlewares/authenticate.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import * as controller from "./subject.controller.js";
import { createSubjectSchema, deleteSubjectSchema, renameSubjectSchema, subjectIdSchema, subjectListQuerySchema } from "./subject.validation.js";

const router = Router();
router.use(authenticate);
router.get("/", validate(subjectListQuerySchema, "query"), controller.listSubjects);
router.post("/", validate(createSubjectSchema), controller.createSubject);
router.patch("/:id", validate(subjectIdSchema, "params"), validate(renameSubjectSchema), controller.renameSubject);
router.post("/:id/deactivate", validate(subjectIdSchema, "params"), controller.deactivateSubject);
router.post("/:id/reactivate", validate(subjectIdSchema, "params"), controller.reactivateSubject);
router.delete("/:id", validate(subjectIdSchema, "params"), validate(deleteSubjectSchema), controller.deleteSubject);

export default router;

