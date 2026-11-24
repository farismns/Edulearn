import test from "node:test";
import assert from "node:assert/strict";
import csrfProtection, {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from "../src/middlewares/csrf.middleware.js";

const token = "a".repeat(64);

const createRequest = ({ method = "POST", cookieToken, headerToken } = {}) => ({
  method,
  cookies: cookieToken ? { [CSRF_COOKIE_NAME]: cookieToken } : {},
  get: (name) => (name === CSRF_HEADER_NAME ? headerToken : undefined),
});

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("CSRF middleware accepts matching cookie and header tokens", () => {
  const response = createResponse();
  let called = false;

  csrfProtection(
    createRequest({ cookieToken: token, headerToken: token }),
    response,
    () => {
      called = true;
    },
  );

  assert.equal(called, true);
  assert.equal(response.statusCode, null);
});

test("CSRF middleware rejects missing or mismatched tokens", () => {
  for (const request of [
    createRequest(),
    createRequest({ cookieToken: token, headerToken: "b".repeat(64) }),
  ]) {
    const response = createResponse();

    csrfProtection(request, response, () => {
      throw new Error("next should not be called");
    });

    assert.equal(response.statusCode, 403);
    assert.deepEqual(response.body, {
      success: false,
      message: "CSRF validation failed.",
    });
  }
});

test("CSRF middleware skips safe methods", () => {
  const response = createResponse();
  let called = false;

  csrfProtection(createRequest({ method: "GET" }), response, () => {
    called = true;
  });

  assert.equal(called, true);
  assert.equal(response.statusCode, null);
});
