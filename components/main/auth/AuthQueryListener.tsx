"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function AuthQueryListener() {
  const searchParams = useSearchParams();
  const { isLoggedIn, openModal } = useAuth();

  useEffect(() => {
    if (searchParams?.get("auth") === "required" && !isLoggedIn) {
      openModal();
    }
  }, [searchParams, isLoggedIn, openModal]);

  return null;
}
