"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function Home() {
  const [status, setStatus] = useState("Not tested");

  async function testConnection() {
    try {
      const response = await apiFetch("/health");
      const data = await response.json();

      setStatus(data.message);
    } catch (error) {
      console.error(error);
      setStatus("Connection failed");
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">EduLearn API Test</h1>

      <button
        onClick={testConnection}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Test Backend Connection
      </button>

      <p className="mt-4">Status: {status}</p>
    </main>
  );
}
