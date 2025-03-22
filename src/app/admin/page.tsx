"use client";

import { useAuthStore } from "@/store/auth";

export default function AdminDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-500 text-lg">
              Welcome{user ? `, ${user.email}` : ""} to the admin dashboard!
              This is where you&apos;ll manage your events.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
