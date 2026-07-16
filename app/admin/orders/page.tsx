import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RowActions } from "@/components/row-actions";
import { AdminFormPanel } from "@/components/admin-form-panel";
import { AdminSearchInput } from "@/components/admin-search-input";
import { NoAccess } from "@/components/no-access";
import { SubmitButton } from "@/components/submit-button";
import { getSessionUser } from "@/lib/dal";
import { createOrder, updateOrder, deleteOrder } from "./actions";

const STATUSES = ["PENDING", "DELIVERED", "CANCELLED"] as const;
const COMM_MEANS = ["SMS", "CALL", "WHATSAPP"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; edit?: string }>;
}) {
  const user = await getSessionUser();
  if (!user?.permissions.includes("ORDERS")) {
    return <NoAccess section="orders" />;
  }

  const { q, edit } = await searchParams;

  const [orders, editing] = await Promise.all([
    prisma.order.findMany({
      where: q ? { customer: { contains: q } } : undefined,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    edit ? prisma.order.findUnique({ where: { id: edit } }) : null,
  ]);

  const inputClass = "w-full rounded border border-zinc-300 px-3 py-1.5";

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-sm flex-1">
          <AdminSearchInput />
        </div>

        <AdminFormPanel
          title={editing ? "Edit order" : "Add order"}
          toggleLabel="+ Add order"
          isEditing={Boolean(editing)}
        >
          <form
            key={editing?.id ?? "new"}
            action={
              editing ? updateOrder.bind(null, editing.id) : createOrder
            }
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-semibold">customer</label>
              <input
                name="customer"
                defaultValue={editing?.customer}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">location</label>
              <input
                name="location"
                defaultValue={editing?.location}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">
                delivery message
              </label>
              <input
                name="deliveryMessage"
                defaultValue={editing?.deliveryMessage ?? undefined}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">status</label>
              <select
                name="status"
                defaultValue={editing?.status ?? "PENDING"}
                className={inputClass}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold">paid</label>
              <input
                type="number"
                name="paid"
                defaultValue={editing?.paid}
                min={0}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">tel</label>
              <input
                name="tel"
                defaultValue={editing?.tel}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">
                comm means
              </label>
              <select
                name="commMeans"
                defaultValue={editing?.commMeans ?? "SMS"}
                className={inputClass}
              >
                {COMM_MEANS.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <SubmitButton
              pendingLabel={editing ? "Saving…" : "Adding…"}
              className="flex items-center justify-center gap-2 rounded bg-zinc-900 py-2 font-semibold text-white disabled:opacity-60"
            >
              {editing ? "Save" : "Add"}
            </SubmitButton>
            {editing && (
              <Link
                href="/admin/orders"
                className="text-center text-sm text-zinc-500 underline"
              >
                Cancel
              </Link>
            )}
          </form>
        </AdminFormPanel>
      </div>

      <div>
        <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-zinc-50 font-semibold">
              <tr>
                <th className="sticky left-0 z-20 w-12 min-w-12 bg-zinc-50 px-4 py-3">
                  s/no
                </th>
                <th className="sticky left-12 z-20 w-32 min-w-32 bg-zinc-50 px-4 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
                  customer
                </th>
                <th className="relative z-0 w-40 min-w-40 px-4 py-3">
                  items
                </th>
                <th className="relative z-0 px-4 py-3">location</th>
                <th className="relative z-0 px-4 py-3">delivery message</th>
                <th className="relative z-0 px-4 py-3">status</th>
                <th className="relative z-0 px-4 py-3">paid</th>
                <th className="relative z-0 px-4 py-3">tel</th>
                <th className="relative z-0 px-4 py-3">comm means</th>
                <th className="relative z-0 px-4 py-3 text-right">actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="sticky left-0 z-10 w-12 min-w-12 bg-white px-4 py-3">
                    {i + 1}
                  </td>
                  <td className="sticky left-12 z-10 w-32 min-w-32 bg-white px-4 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
                    {o.customer}
                  </td>
                  <td className="relative z-0 w-40 min-w-40 max-w-40 px-4 py-3">
                    {o.items.length === 0 ? (
                      <span className="text-zinc-400">—</span>
                    ) : (
                      <ul>
                        {o.items.map((item) => (
                          <li key={item.id}>
                            {item.quantity} x {item.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="relative z-0 px-4 py-3">{o.location}</td>
                  <td className="relative z-0 px-4 py-3">{o.deliveryMessage}</td>
                  <td className="relative z-0 px-4 py-3 capitalize">
                    {o.status.toLowerCase()}
                  </td>
                  <td className="relative z-0 px-4 py-3">{o.paid.toLocaleString()}</td>
                  <td className="relative z-0 px-4 py-3">{o.tel}</td>
                  <td className="relative z-0 px-4 py-3 capitalize">
                    {o.commMeans.toLowerCase()}
                  </td>
                  <td className="relative z-0 px-4 py-3 text-right">
                    <RowActions
                      editHref={`/admin/orders?edit=${o.id}`}
                      deleteAction={deleteOrder.bind(null, o.id)}
                    />
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-zinc-400">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
