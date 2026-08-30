import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useLocalAuth } from "@/lib/localAuth";

export default function LocalAuthGuard() {
  const { user } = useLocalAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}