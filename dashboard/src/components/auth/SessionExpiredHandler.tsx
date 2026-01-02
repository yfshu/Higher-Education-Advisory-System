"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SessionExpiredModal } from "./SessionExpiredModal";

/**
 * Global Session Expiry Handler
 * 
 * Listens for session expiry events and shows the modal
 * This component should be added to the root layout
 */
export function SessionExpiredHandler() {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | undefined>();
  const pathname = usePathname();

  useEffect(() => {
    const handleSessionExpired = (event: CustomEvent) => {
      const { redirectPath: eventRedirectPath } = event.detail || {};
      setRedirectPath(eventRedirectPath || pathname);
      setIsOpen(true);
    };

    // Listen for session-expired events
    window.addEventListener('session-expired' as any, handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired' as any, handleSessionExpired);
    };
  }, [pathname]);

  return (
    <SessionExpiredModal
      open={isOpen}
      onOpenChange={setIsOpen}
      redirectPath={redirectPath}
    />
  );
}

