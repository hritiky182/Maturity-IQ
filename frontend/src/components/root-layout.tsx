import React, { useEffect } from "react";
import { Outlet, useLocation, Navigate, useNavigate } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/lib/store";

export default function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // Programmatically trigger a seed data reset once to ensure Emaar Properties has completed assessments for the client demo.
  useEffect(() => {
    if (!localStorage.getItem("demo-seeded-v3")) {
      useStore.getState().resetAllData();
      localStorage.setItem("demo-seeded-v3", "true");
    }
  }, []);

  const currentUser = useStore((state) => state.currentUser);
  const isLoggedIn = currentUser !== null || localStorage.getItem("isLoggedIn") === "true";
  const userRole = currentUser?.role || localStorage.getItem("userRole");

  const isPublicRoute = ["/login", "/register", "/forgot-password"].includes(pathname);

  useEffect(() => {
    if (isLoggedIn) {
      if (isPublicRoute) {
        if (userRole === "Admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else if (userRole === "Admin" && !pathname.startsWith("/admin")) {
        // Admin tried to access an organization path, redirect to admin dashboard
        navigate("/admin/dashboard", { replace: true });
      } else if (userRole === "Organization User" && pathname.startsWith("/admin")) {
        // Organization User tried to access an admin path, redirect to org dashboard
        navigate("/", { replace: true });
      }
    }
  }, [isLoggedIn, userRole, pathname, isPublicRoute, navigate]);

  if (!isLoggedIn) {
    if (!isPublicRoute) {
      return <Navigate to="/login" replace />;
    }
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
        <Toaster position="top-right" richColors />
      </div>
    );
  }

  // Prevent flashing of public pages before redirection in useEffect
  if (isPublicRoute) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <div className="lg:pl-64">
          <Outlet />
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
