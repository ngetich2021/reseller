import { siteConfig } from "@/lib/site-config";

export function ContactBar() {
  return (
    <div className="flex items-center gap-3">
      <a
        href={siteConfig.tiktokUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M16.6 5.82c-.98-.86-1.6-2.09-1.6-3.44V2h-3.24v13.4c0 1.5-1.23 2.72-2.75 2.72a2.73 2.73 0 0 1-2.75-2.72c0-1.5 1.23-2.72 2.75-2.72.28 0 .55.04.8.12V9.4a6 6 0 0 0-.8-.05A6 6 0 0 0 3 15.4a6 6 0 0 0 6.01 5.98A6 6 0 0 0 15 15.4V9.13a7.4 7.4 0 0 0 4.32 1.4V7.28a3.99 3.99 0 0 1-2.72-1.46z" />
        </svg>
      </a>
      <a
        href={`https://wa.me/${siteConfig.whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.05-1.35A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.13-.43-4.46-1.24l-.32-.19-3.02.8.81-2.94-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.53-6.15c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.16-.29.18-.53.06-.25-.12-1.06-.39-2.02-1.24-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.38.11-.5.11-.12.25-.29.37-.44.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.16 0-.42.06-.64.31-.22.25-.85.83-.85 2.02s.87 2.34 1 2.5c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.28z" />
        </svg>
      </a>
      <a
        href={`tel:${siteConfig.callNumber.replace(/\s+/g, "")}`}
        aria-label="Call"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02z" />
        </svg>
      </a>
    </div>
  );
}
