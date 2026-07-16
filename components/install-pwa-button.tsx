"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function isStandaloneDisplay() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function getInstallInstructions(): { title: string; steps: string[] } {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  // Excludes Chrome/Firefox/Android browsers that also mention "Safari" in their UA.
  const isSafari = /^((?!chrome|crios|fxios|android).)*safari/i.test(ua);
  const isFirefox = /firefox|fxios/i.test(ua);
  const isOpera = /opr\/|opera/i.test(ua);
  const isAndroid = /android/i.test(ua);

  if (isIOS && isSafari) {
    return {
      title: "Install on iPhone/iPad",
      steps: [
        "Tap the Share icon in Safari's toolbar.",
        'Scroll down and tap "Add to Home Screen".',
        'Tap "Add" to confirm.',
      ],
    };
  }

  if (isSafari) {
    return {
      title: "Install on Safari",
      steps: [
        "Click the Share icon in the toolbar (or the File menu).",
        'Choose "Add to Dock" to install the app.',
      ],
    };
  }

  if (isFirefox) {
    return {
      title: "Install on Firefox",
      steps: isAndroid
        ? ["Open the browser menu (⋮).", 'Tap "Install" or "Add to Home screen".']
        : [
            "Firefox for desktop doesn't support one-tap app install yet.",
            "You can still bookmark this page for quick access.",
          ],
    };
  }

  if (isOpera) {
    return {
      title: "Install on Opera",
      steps: [
        "Open the Opera menu, or look for an install icon in the address bar.",
        'Select "Install" or "Add to Home screen".',
      ],
    };
  }

  return {
    title: "Install this app",
    steps: [
      "Look for an install icon in the address bar (⊕ or a monitor with an arrow).",
      'Or open the browser menu and choose "Install app" / "Add to Home screen".',
    ],
  };
}

function InstallInstructions({ onClose }: { onClose: () => void }) {
  const { title, steps } = getInstallInstructions();

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-lg leading-none text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            ×
          </button>
        </div>
        <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-sm text-zinc-600 dark:text-zinc-300">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function InstallPwaButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    setInstalled(isStandaloneDisplay());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }
    function handleAppInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (installed) return null;

  async function handleClick() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstallPrompt(null);
      return;
    }
    setShowInstructions(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 hover:underline dark:hover:text-zinc-300"
      >
        <DownloadIcon />
        Download app
      </button>
      {showInstructions && (
        <InstallInstructions onClose={() => setShowInstructions(false)} />
      )}
    </>
  );
}
