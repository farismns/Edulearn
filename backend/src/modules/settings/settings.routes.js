import { Router } from "express";
import authenticate from "../../middlewares/authenticate.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import * as controller from "./settings.controller.js";
import { appearanceSchema, changePasswordSchema, profileSchema, publicContactSchema } from "./settings.validation.js";

const router = Router();
router.use(authenticate);
router.get("/", controller.getSettings);
router.patch("/profile", validate(profileSchema), controller.updateProfile);
router.patch("/public-contact", validate(publicContactSchema), controller.updatePublicContact);
router.patch("/appearance", validate(appearanceSchema), controller.updateAppearance);
router.post("/change-password", validate(changePasswordSchema), controller.updatePassword);

export default router;

