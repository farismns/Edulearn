import { randomBytes, createHash } from "node:crypto";

export const generateVerificationToken = () => {
  return randomBytes(32).toString("hex");
};

export const hashVerificationToken = (token) => {
  return createHash("sha256").update(token).digest("hex");
};
