import { createHash, createHmac } from "node:crypto";

const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"];
const awsEncode = (value) => encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
const hmac = (key, value, encoding) => createHmac("sha256", key).update(value).digest(encoding);

const getConfig = () => {
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing R2 configuration: ${missing.join(", ")}`);
  return {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
    endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  };
};

const presignedUrl = ({ method, key, expiresInSeconds }) => {
  const config = getConfig();
  const endpoint = new URL(config.endpoint);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const canonicalUri = `/${awsEncode(config.bucket)}/${key.split("/").map(awsEncode).join("/")}`;
  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${config.accessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresInSeconds),
    "X-Amz-SignedHeaders": "host",
  });
  const canonicalQuery = [...query.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => `${awsEncode(name)}=${awsEncode(value)}`).join("&");
  const canonicalHeaders = `host:${endpoint.host}\n`;
  const canonicalRequest = [method, canonicalUri, canonicalQuery, canonicalHeaders, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, createHash("sha256").update(canonicalRequest).digest("hex")].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${config.secretAccessKey}`, dateStamp), "auto"), "s3"), "aws4_request");
  query.set("X-Amz-Signature", hmac(signingKey, stringToSign, "hex"));
  return `${endpoint.origin}${canonicalUri}?${[...query.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => `${awsEncode(name)}=${awsEncode(value)}`).join("&")}`;
};

export const uploadPrivatePdf = async ({ key, body }) => {
  const url = presignedUrl({ method: "PUT", key, expiresInSeconds: 900 });
  const response = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/pdf" }, body });
  if (!response.ok) throw new Error(`R2 upload failed with status ${response.status}.`);
  return { key, size: body.length, contentType: "application/pdf" };
};

export const createPrivateDownloadUrl = async ({ key, expiresInSeconds = 300 }) => ({
  url: presignedUrl({ method: "GET", key, expiresInSeconds }),
  expiresInSeconds,
});

export const deletePrivateObject = async (key) => {
  const url = presignedUrl({ method: "DELETE", key, expiresInSeconds: 900 });
  const response = await fetch(url, { method: "DELETE" });
  if (!response.ok && response.status !== 404) throw new Error(`R2 cleanup failed with status ${response.status}.`);
};

