"use client";

import { useState } from "react";

export function OfferFields({
  defaultChecked,
  defaultOfferPrice,
  defaultOfferEndsAt,
  inputClass,
}: {
  defaultChecked: boolean;
  defaultOfferPrice?: number;
  defaultOfferEndsAt?: string;
  inputClass: string;
}) {
  const [onOffer, setOnOffer] = useState(defaultChecked);
  const [minEndsAt] = useState(() => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
  });

  return (
    <>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="onOffer"
          name="onOffer"
          checked={onOffer}
          onChange={(e) => setOnOffer(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="onOffer" className="text-sm font-semibold">
          On offer{" "}
          <span className="font-normal text-zinc-500">
            featured in Today&apos;s Deals until it ends; price then
            reverts to the regular price above
          </span>
        </label>
      </div>

      {onOffer && (
        <>
          <div>
            <label className="block text-sm font-semibold">
              offer price (ksh){" "}
              <span className="font-normal text-zinc-500">
                must be lower than the regular price; used only while the
                offer is active
              </span>
            </label>
            <input
              type="number"
              name="offerPrice"
              defaultValue={defaultOfferPrice}
              min={0}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">
              offer ends at
            </label>
            <input
              type="datetime-local"
              name="offerEndsAt"
              defaultValue={defaultOfferEndsAt}
              min={minEndsAt}
              required
              className={inputClass}
            />
          </div>
        </>
      )}
    </>
  );
}
