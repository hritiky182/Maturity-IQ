import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  // Dummy auth check (frontend only)
  // If not logged in, redirect to login page (we can check localStorage or store)
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  if (!isLoggedIn && !isLogin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {isLogin ? (
        <Outlet />
      ) : (
        <div className="min-h-screen bg-background">
          <AppSidebar />
          <div className="lg:pl-64">
            <Outlet />
          </div>
        </div>
      )}
      <Toaster position="top-right" richColors />
    </div>
  );
}
