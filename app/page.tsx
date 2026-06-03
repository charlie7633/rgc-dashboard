"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const mode = sessionStorage.getItem("rgc_mode");
    if (mode === "demo") router.replace("/overview");
    else if (mode === "custom") router.replace("/overview");
    else router.replace("/upload");
  }, [router]);
  return null;
}
