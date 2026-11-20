import test from "node:test";
import assert from "node:assert/strict";
import { appearanceSchema, changePasswordSchema, profileSchema, publicContactSchema } from "../src/modules/settings/settings.validation.js";

test("profile accepts only approved avatar identifiers", () => {
  assert.equal(profileSchema.validate({ fullName: "Tutor", avatar: "student_avatar_01" }).error, undefined);
  assert.ok(profileSchema.validate({ fullName: "Tutor", avatar: "character_1" }).error);
});

test("public WhatsApp accepts international digits only and allows clearing", () => {
  assert.equal(publicContactSchema.validate({ whatsappNumber: "6281234567890" }).error, undefined);
  assert.equal(publicContactSchema.validate({ whatsappNumber: "" }).error, undefined);
  assert.ok(publicContactSchema.validate({ whatsappNumber: "+6281234567890" }).error);
  assert.ok(publicContactSchema.validate({ whatsappNumber: "62 81234567890" }).error);
});

test("appearance accepts only Light, Dark, or System", () => {
  assert.equal(appearanceSchema.validate({ theme: "Dark" }).error, undefined);
  assert.ok(appearanceSchema.validate({ theme: "Solarized" }).error);
});

test("change password requires the current password and matching new password", () => {
  assert.equal(changePasswordSchema.validate({ currentPassword: "old-password", newPassword: "new-password", confirmPassword: "new-password" }).error, undefined);
  assert.ok(changePasswordSchema.validate({ newPassword: "new-password", confirmPassword: "different" }).error);
});

