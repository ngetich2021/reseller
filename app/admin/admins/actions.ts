"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/dal";
import { PERMISSIONS, stringifyPermissions } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

const inviteSchema = z.object({
  email: z.email().trim().toLowerCase(),
  permissions: z.array(z.enum(PERMISSIONS)),
});

export async function inviteAdmin(formData: FormData) {
  await assertPermission("ADMINS");
  const { email, permissions } = inviteSchema.parse({
    email: formData.get("email"),
    permissions: formData.getAll("permissions"),
  });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser?.role === "ADMIN") return;

  const permissionsStr = stringifyPermissions(permissions);

  await prisma.adminInvite.upsert({
    where: { email },
    update: { permissions: permissionsStr },
    create: { email, permissions: permissionsStr },
  });

  revalidatePath("/admin/admins");
}

export async function updateInvite(id: string, formData: FormData) {
  await assertPermission("ADMINS");
  const { email, permissions } = inviteSchema.parse({
    email: formData.get("email"),
    permissions: formData.getAll("permissions"),
  });

  await prisma.adminInvite.update({
    where: { id },
    data: { email, permissions: stringifyPermissions(permissions) },
  });

  revalidatePath("/admin/admins");
}

export async function cancelInvite(id: string, _formData: FormData) {
  await assertPermission("ADMINS");
  await prisma.adminInvite.delete({ where: { id } });
  revalidatePath("/admin/admins");
}

export async function revokeAdmin(id: string, _formData: FormData) {
  const currentAdmin = await assertPermission("ADMINS");
  if (id === currentAdmin.id) {
    throw new Error("You can't revoke your own access.");
  }
  await prisma.user.update({
    where: { id },
    data: { role: "USER", permissions: "" },
  });
  revalidatePath("/admin/admins");
}
