const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);
