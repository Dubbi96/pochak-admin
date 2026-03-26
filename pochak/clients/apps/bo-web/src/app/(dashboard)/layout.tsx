"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/stores/auth-store";
import { hasPermission } from "@/lib/permissions";
import { toast } from "@/lib/use-toast";
import { NetworkStatusBanner } from "@/components/common/api-error-handler";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // RBAC route guard: check permissions on every route change
  React.useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (!hasPermission(user.role, pathname)) {
      toast({
        title: "접근 권한이 없습니다",
        variant: "destructive",
      });
      router.replace("/");
    }
  }, [isAuthenticated, user, pathname, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <NetworkStatusBanner />
      <div className="flex h-full">
        {/* Sidebar: 220px on desktop */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-[#f8f9fb] px-6 py-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
