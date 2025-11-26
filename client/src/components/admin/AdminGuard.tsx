import { useEffect } from "react";
import { useLocation } from "wouter";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [, navigate] = useLocation();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in") === "true";
    if (!isLoggedIn) {
      navigate("/admin");
    }
  }, [navigate]);

  const isLoggedIn = localStorage.getItem("admin_logged_in") === "true";
  if (!isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}
