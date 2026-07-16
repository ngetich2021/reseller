"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m ${seconds}s left`;
  return `${seconds}s left`;
}

export function OfferCountdown({
  endsAt,
  className,
}: {
  endsAt: string;
  className?: string;
}) {
  const end = new Date(endsAt).getTime();
  const router = useRouter();
  const [remaining, setRemaining] = useState(() => end - Date.now());

  useEffect(() => {
    const tick = () => {
      const diff = end - Date.now();
      setRemaining(diff);
      if (diff <= 0) {
        clearInterval(interval);
        router.refresh();
      }
    };
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [end, router]);

  if (remaining <= 0) return null;

  return <span className={className}>{formatRemaining(remaining)}</span>;
}
