"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Viewer doesn't need to login anymore
    router.replace("/dashboard");
  }, [router]);

  return null;
}
