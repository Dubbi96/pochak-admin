"use client";

import React, { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { toast } from "@/lib/use-toast";

/**
 * Network status indicator banner.
 * Shows an offline banner at the top of the page when the browser is offline.
 *
 * Usage: Place inside the root layout or dashboard layout.
 *   <NetworkStatusBanner />
 */
export function NetworkStatusBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initialize from current state
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: "네트워크 연결 복구",
        description: "인터넷 연결이 복구되었습니다.",
        variant: "success",
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: "네트워크 연결 끊김",
        description: "인터넷 연결을 확인해주세요.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
      <WifiOff size={16} />
      <span>네트워크 연결이 끊겼습니다. 인터넷 연결을 확인해주세요.</span>
    </div>
  );
}

/**
 * Show a toast notification for an API error.
 * Can be called from anywhere in the app.
 */
export function showApiErrorToast(error: unknown, context?: string) {
  const prefix = context ? `[${context}] ` : "";

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    toast({
      title: `${prefix}네트워크 오류`,
      description: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
      variant: "destructive",
    });
    return;
  }

  if (error instanceof Error) {
    const httpMatch = error.message.match(/HTTP (\d+)/);
    if (httpMatch) {
      const status = parseInt(httpMatch[1], 10);
      if (status === 401) {
        toast({
          title: `${prefix}인증 만료`,
          description: "다시 로그인해주세요.",
          variant: "destructive",
        });
        return;
      }
      if (status === 403) {
        toast({
          title: `${prefix}접근 권한이 없습니다`,
          variant: "destructive",
        });
        return;
      }
      if (status >= 500) {
        toast({
          title: `${prefix}서버 오류`,
          description: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: `${prefix}오류 발생`,
      description: error.message,
      variant: "destructive",
    });
    return;
  }

  toast({
    title: `${prefix}알 수 없는 오류`,
    description: "예상치 못한 오류가 발생했습니다.",
    variant: "destructive",
  });
}
