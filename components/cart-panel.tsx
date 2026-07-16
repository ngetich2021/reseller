"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { siteConfig } from "@/lib/site-config";
import { placeOrder } from "@/app/cart/actions";
import { isValidPhone } from "@/lib/validation";

export function CartPanel() {
  const { items, updateQuantity, removeItem, total, clear } = useCart();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    customer: "",
    tel: "",
    location: "",
    deliveryMessage: "",
  });
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (
      form.customer.trim().length < 2 ||
      !form.location.trim() ||
      !form.tel.trim()
    ) {
      setError("Please fill in your name, phone and location.");
      return;
    }
    if (!isValidPhone(form.tel)) {
      setError("Please enter a valid phone number, e.g. 0712345678.");
      return;
    }

    startTransition(async () => {
      try {
        const { orderId } = await placeOrder({
          customer: form.customer,
          tel: form.tel,
          location: form.location,
          deliveryMessage: form.deliveryMessage || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        });

        const lines = [
          `New order #${orderId.slice(-6)}`,
          ...items.map(
            (i) =>
              `${i.quantity} x ${i.name} - ksh ${(i.price * i.quantity).toLocaleString()}`
          ),
          `Total: ksh ${total.toLocaleString()}`,
          "",
          `Name: ${form.customer}`,
          `Phone: ${form.tel}`,
          `Location: ${form.location}`,
          form.deliveryMessage ? `Note: ${form.deliveryMessage}` : "",
        ].filter(Boolean);

        const message = encodeURIComponent(lines.join("\n"));
        clear();
        window.location.href = `https://wa.me/${siteConfig.whatsappNumber}?text=${message}`;
      } catch {
        setError("Something went wrong placing your order. Please try again.");
      }
    });
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        Your cart is empty.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.productId}
          className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
              {item.name}
            </p>
            <p className="text-sm text-zinc-500">
              ksh {item.price.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 text-lg leading-none dark:border-zinc-700"
            >
              −
            </button>
            <span className="w-6 text-center">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 text-lg leading-none dark:border-zinc-700"
            >
              +
            </button>
          </div>
          <p className="w-24 text-right font-semibold">
            ksh {(item.price * item.quantity).toLocaleString()}
          </p>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            aria-label="Remove"
            className="text-zinc-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      ))}

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 font-semibold dark:border-zinc-800 dark:bg-zinc-900">
        <span>Total</span>
        <span>ksh {total.toLocaleString()}</span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">
          Delivery details
        </h2>
        <div>
          <label className="block text-sm font-semibold">Your name</label>
          <input
            value={form.customer}
            onChange={(e) => setForm({ ...form, customer: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Phone number</label>
          <input
            type="tel"
            inputMode="tel"
            placeholder="0712345678"
            value={form.tel}
            onChange={(e) => setForm({ ...form, tel: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">
            Delivery location
          </label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">
            Note (optional)
          </label>
          <textarea
            value={form.deliveryMessage}
            onChange={(e) =>
              setForm({ ...form, deliveryMessage: e.target.value })
            }
            rows={2}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-500 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-60"
        >
          {isPending ? "Placing order..." : "Place order via WhatsApp"}
        </button>
      </form>
    </div>
  );
}
