import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/dal";
import { NoAccess } from "@/components/no-access";
import { SubmitButton } from "@/components/submit-button";
import { PERMISSIONS, PERMISSION_LABELS, parsePermissions } from "@/lib/permissions";
import { inviteAdmin, updateInvite, cancelInvite, revokeAdmin } from "./actions";

const TABS = [
  { key: "admin", label: "Admin" },
  { key: "pending", label: "Pending" },
  { key: "invite", label: "Invite" },
] as const;

function PermissionBadges({ permissions }: { permissions: string }) {
  const parsed = parsePermissions(permissions);
  if (parsed.length === 0) {
    return <span className="text-xs text-zinc-400">No access</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {parsed.map((p) => (
        <span
          key={p}
          className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600"
        >
          {PERMISSION_LABELS[p]}
        </span>
      ))}
    </div>
  );
}

export default async function AdminAdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; edit?: string }>;
}) {
  const currentUser = await getSessionUser();
  if (!currentUser?.permissions.includes("ADMINS")) {
    return <NoAccess section="admins" />;
  }

  const { tab: rawTab, edit } = await searchParams;
  const tab = rawTab === "pending" || rawTab === "invite" ? rawTab : "admin";

  const [admins, invites, editingInvite] = await Promise.all([
    tab === "admin"
      ? prisma.user.findMany({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } })
      : Promise.resolve([]),
    tab === "pending"
      ? prisma.adminInvite.findMany({ orderBy: { createdAt: "asc" } })
      : Promise.resolve([]),
    tab === "invite" && edit
      ? prisma.adminInvite.findUnique({ where: { id: edit } })
      : Promise.resolve(null),
  ]);

  const inputClass = "w-full rounded border border-zinc-300 px-3 py-1.5";

  return (
    <div className="flex flex-col gap-6 p-6">
      <nav className="flex items-center gap-6 border-b border-zinc-200 font-semibold">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              href={t.key === "admin" ? "/admin/admins" : `/admin/admins?tab=${t.key}`}
              className={`-mb-px border-b-2 px-1 pb-3 text-sm ${
                active
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {tab === "admin" && (
        <div className="rounded border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-zinc-50 font-semibold">
                <tr>
                  <th className="sticky left-0 z-20 w-32 min-w-32 bg-zinc-50 px-4 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
                    name
                  </th>
                  <th className="relative z-0 px-4 py-3">email</th>
                  <th className="relative z-0 px-4 py-3">access</th>
                  <th className="relative z-0 px-4 py-3 text-right">actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b last:border-0">
                    <td className="sticky left-0 z-10 w-32 min-w-32 max-w-32 truncate bg-white px-4 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
                      {admin.name ?? "—"}
                    </td>
                    <td className="relative z-0 px-4 py-3">{admin.email}</td>
                    <td className="relative z-0 px-4 py-3">
                      <PermissionBadges permissions={admin.permissions} />
                    </td>
                    <td className="relative z-0 px-4 py-3 text-right">
                      {admin.id === currentUser?.id ? (
                        <span className="text-xs text-zinc-400">You</span>
                      ) : (
                        <form action={revokeAdmin.bind(null, admin.id)}>
                          <SubmitButton
                            pendingLabel="Revoking…"
                            className="ml-auto flex items-center gap-2 text-sm text-red-600 hover:underline disabled:opacity-60"
                          >
                            Revoke
                          </SubmitButton>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">
                      No admins yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "pending" && (
        <div className="rounded border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-zinc-50 font-semibold">
                <tr>
                  <th className="sticky left-0 z-20 w-40 min-w-40 bg-zinc-50 px-4 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
                    email
                  </th>
                  <th className="relative z-0 px-4 py-3">access</th>
                  <th className="relative z-0 px-4 py-3 text-right">actions</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-b last:border-0">
                    <td className="sticky left-0 z-10 w-40 min-w-40 max-w-40 truncate bg-white px-4 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
                      {invite.email}
                    </td>
                    <td className="relative z-0 px-4 py-3">
                      <PermissionBadges permissions={invite.permissions} />
                    </td>
                    <td className="relative z-0 px-4 py-3 text-right">
                      <div className="ml-auto flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/admins?tab=invite&edit=${invite.id}`}
                          className="text-sm text-zinc-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <form action={cancelInvite.bind(null, invite.id)}>
                          <SubmitButton
                            pendingLabel="Cancelling…"
                            className="flex items-center gap-2 text-sm text-red-600 hover:underline disabled:opacity-60"
                          >
                            Cancel
                          </SubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {invites.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-zinc-400">
                      No pending invites.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "invite" && (
        <div className="w-full max-w-sm rounded border border-rose-100 bg-rose-50 p-6">
          <h2 className="mb-2 text-lg font-semibold">
            {editingInvite ? "Edit invite" : "Invite an admin"}
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            They&apos;ll get access to the sections you pick the moment they
            sign in with this Google account.
          </p>
          <form
            key={editingInvite?.id ?? "new"}
            action={
              editingInvite ? updateInvite.bind(null, editingInvite.id) : inviteAdmin
            }
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-semibold">email</label>
              <input
                type="email"
                name="email"
                required
                defaultValue={editingInvite?.email}
                placeholder="name@gmail.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">
                access
              </label>
              <div className="flex flex-col gap-1.5">
                {PERMISSIONS.map((permission) => (
                  <label
                    key={permission}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="permissions"
                      value={permission}
                      defaultChecked={
                        editingInvite
                          ? parsePermissions(editingInvite.permissions).includes(
                              permission
                            )
                          : false
                      }
                    />
                    {PERMISSION_LABELS[permission]}
                  </label>
                ))}
              </div>
            </div>
            <SubmitButton
              pendingLabel={editingInvite ? "Saving…" : "Sending…"}
              className="flex items-center justify-center gap-2 rounded bg-zinc-900 py-2 font-semibold text-white disabled:opacity-60"
            >
              {editingInvite ? "Save" : "Send invite"}
            </SubmitButton>
            {editingInvite && (
              <Link
                href="/admin/admins?tab=invite"
                className="text-center text-sm text-zinc-500 underline"
              >
                Cancel
              </Link>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
