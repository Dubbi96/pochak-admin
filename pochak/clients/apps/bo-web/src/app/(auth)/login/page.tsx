"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { GATEWAY_URL } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      // Try real backend login first
      const res = await fetch(`${GATEWAY_URL}/admin/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const payload = data.data ?? data;
        login(payload.token, {
          id: payload.user?.id || "1",
          name: payload.user?.name || username,
          email: payload.user?.email || "",
          role: payload.user?.role || "MASTER_BO",
        });
        router.push("/");
        return;
      }

      // Non-OK response from backend (e.g. 401) — show error
      if (res.status === 401) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        setIsLoading(false);
        return;
      }
    } catch {
      // Backend unavailable — fall through to mock login
      console.warn("[Login] Backend unavailable, using mock login");
    }

    // Mock login fallback (development only)
    if (username === "admin" && password === "admin1234!") {
      login("mock-jwt-token", {
        id: "1",
        name: "시스템 관리자",
        email: "admin@pochak.com",
        role: "MASTER_BO",
      });
      router.push("/");
    } else {
      setError("로그인에 실패했습니다. (mock: admin / admin1234!)");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
              P
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              POCHAK <span className="text-blue-600">BO</span>
            </span>
          </div>
          <p className="text-sm text-gray-500">관리자 로그인</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              아이디
            </label>
            <input
              id="username"
              type="text"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="block h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="block h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-md bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            &copy; 2024 POCHAK. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
