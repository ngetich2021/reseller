"use client";

import Link, { useLinkStatus } from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Spinner } from "@/components/spinner";
import { SubmitButton } from "@/components/submit-button";

// Must be rendered as a child of <Link> — useLinkStatus only reads the
// pending state from the nearest ancestor Link, not from the component
// that renders the Link itself.
function EditLinkStatus({ onNavigated }: { onNavigated: () => void }) {
  const { pending } = useLinkStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) onNavigated();
    wasPending.current = pending;
  }, [pending, onNavigated]);

  return (
    <>
      {pending && <Spinner className="text-zinc-500" />}
      {pending ? "Opening…" : "Edit"}
    </>
  );
}

function EditMenuItem({
  editHref,
  onNavigated,
}: {
  editHref: string;
  onNavigated: () => void;
}) {
  return (
    <Link
      href={editHref}
      className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-zinc-50"
    >
      <EditLinkStatus onNavigated={onNavigated} />
    </Link>
  );
}

export function RowActions({
  editHref,
  deleteAction,
  extraActions,
}: {
  editHref: string;
  deleteAction: (formData: FormData) => Promise<void>;
  extraActions?: { label: string; action: (formData: FormData) => Promise<void> }[];
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function updatePosition() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 4, left: rect.right - 128 });
  }

  function toggle() {
    if (!open) updatePosition();
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className="rounded px-2 py-1 text-lg leading-none hover:bg-zinc-100"
      >
        &#8942;
      </button>
      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: position.top, left: position.left }}
            className="fixed z-30 w-32 rounded border border-zinc-200 bg-white py-1 shadow-md"
          >
            <EditMenuItem editHref={editHref} onNavigated={() => setOpen(false)} />
            {extraActions?.map((extra) => (
              <form key={extra.label} action={extra.action}>
                <SubmitButton
                  pendingLabel="Working…"
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-zinc-50 disabled:opacity-60"
                >
                  {extra.label}
                </SubmitButton>
              </form>
            ))}
            <form action={deleteAction}>
              <SubmitButton
                pendingLabel="Deleting…"
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600 hover:bg-zinc-50 disabled:opacity-60"
              >
                Delete
              </SubmitButton>
            </form>
          </div>,
          document.body
        )}
    </>
  );
}
