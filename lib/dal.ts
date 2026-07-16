import "server-only";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Permission, parsePermissions } from "@/lib/permissions";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, permissions: true },
  });
  if (!dbUser) return null;

  return {
    ...session.user,
    role: dbUser.role,
    permissions: parsePermissions(dbUser.permissions),
  };
}

export async function assertAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function assertPermission(permission: Permission) {
  const user = await assertAdmin();
  if (!user.permissions.includes(permission)) {
    throw new Error("Unauthorized");
  }
  return user;
}
