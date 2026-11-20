import test from "node:test";
import assert from "node:assert/strict";
import { registerSchema, resetPasswordSchema, changePasswordSchema } from "../src/modules/auth/auth.validation.js";

test("registration validation accepts a valid payload", () => {
  const { error } = registerSchema.validate({
    fullName: "Tutor",
    email: "tutor@example.com",
    password: "password123",
    confirmPassword: "password123",
  });
  assert.equal(error, undefined);
});

test("registration validation rejects a short password and mismatch", () => {
  const { error } = registerSchema.validate({
    fullName: "Tutor",
    email: "tutor@example.com",
    password: "short",
    confirmPassword: "different",
  }, { abortEarly: false });
  assert.equal(error.details.length, 2);
});

test("reset and change password schemas require matching eight-character passwords", () => {
  for (const schema of [resetPasswordSchema, changePasswordSchema]) {
    const payload = schema === resetPasswordSchema
      ? { token: "a".repeat(64), newPassword: "password123", confirmPassword: "password123" }
      : { currentPassword: "old-password", newPassword: "password123", confirmPassword: "password123" };
    assert.equal(schema.validate(payload).error, undefined);
  }
});

