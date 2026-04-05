"use client";

import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import { useEffect, useRef } from "react";

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.15 });

export function NavigationProgress() {
  return (
    <NavigationProgressInner />
  );
}

function NavigationProgressInner() {
  const pathname = usePathname();
  const currentUrl = useRef(pathname);

  useEffect(() => {
    if (currentUrl.current !== pathname) {
      currentUrl.current = pathname;
      NProgress.start();
    }

    const timeout = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
