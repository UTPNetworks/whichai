"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth/signup");
  }, [router]);
  return null;
}
