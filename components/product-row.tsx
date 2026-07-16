"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { RowActions } from "@/components/row-actions";
import { ProductDetailsModal } from "@/components/product-details-modal";

type ProductRowData = {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  originalPrice: number | null;
  onOffer: boolean;
  offerPrice: number | null;
  offerEndsAt: Date | null;
  imageUrl: string;
  category: { name: string } | null;
  subCategory: { name: string } | null;
};

export function ProductRow({
  product,
  index,
  isActiveOffer,
  isExpiredOffer,
  editHref,
  deleteAction,
  extraActions,
}: {
  product: ProductRowData;
  index: number;
  isActiveOffer: boolean;
  isExpiredOffer: boolean;
  editHref: string;
  deleteAction: (formData: FormData) => Promise<void>;
  extraActions?: { label: string; action: (formData: FormData) => Promise<void> }[];
}) {
  const [viewing, setViewing] = useState(false);

  return (
    <>
      <tr
        onClick={() => setViewing(true)}
        className="cursor-pointer border-b last:border-0 hover:bg-zinc-50"
      >
        <td className="sticky left-0 z-10 w-12 min-w-12 bg-white px-4 py-3">
          {index}
        </td>
        <td className="sticky left-12 z-10 w-20 min-w-20 bg-white px-4 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
          <div className="relative h-10 w-10 overflow-hidden rounded bg-zinc-100">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        </td>
        <td className="sticky left-32 z-10 w-32 min-w-32 max-w-32 truncate bg-white px-4 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
          {product.name}
        </td>
        <td className="relative z-0 px-4 py-3">{product.location}</td>
        <td className="relative z-0 max-w-xs truncate px-4 py-3">
          {product.description}
        </td>
        <td className="relative z-0 px-4 py-3">
          {isActiveOffer ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              Until {product.offerEndsAt!.toLocaleString()}
            </span>
          ) : isExpiredOffer ? (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500">
              Expired
            </span>
          ) : (
            <span className="text-zinc-300">—</span>
          )}
        </td>
        <td
          onClick={(e) => e.stopPropagation()}
          className="relative z-0 px-4 py-3 text-right"
        >
          <RowActions
            editHref={editHref}
            deleteAction={deleteAction}
            extraActions={extraActions}
          />
        </td>
      </tr>

      {viewing &&
        createPortal(
          <ProductDetailsModal
            product={product}
            onClose={() => setViewing(false)}
          />,
          document.body
        )}
    </>
  );
}
