"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthModals } from "@/components/auth/AuthModalProvider";

export default function RegisterRoute() {
  const router = useRouter();
  const { openRegister, closeRegister, isRegisterOpen } = useAuthModals();

  useEffect(() => {
    openRegister();
  }, [openRegister]);

  useEffect(() => {
    if (!isRegisterOpen) {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    }
    return () => {
      closeRegister();
    };
  }, [isRegisterOpen, closeRegister, router]);

  return null;
}
