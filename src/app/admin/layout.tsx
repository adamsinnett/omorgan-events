"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Navigation } from "@/components/admin/Navigation";
import { useAuthStore } from "@/store/auth";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !token && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [token, pathname, router, isLoading]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
