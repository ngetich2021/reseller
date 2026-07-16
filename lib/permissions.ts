export const PERMISSIONS = ["PRODUCTS", "ORDERS", "CATEGORIES", "ADMINS"] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  PRODUCTS: "Products",
  ORDERS: "Orders",
  CATEGORIES: "Categories",
  ADMINS: "Admins",
};

export function parsePermissions(value: string | null | undefined): Permission[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v): v is Permission => (PERMISSIONS as readonly string[]).includes(v));
}

export function stringifyPermissions(permissions: Permission[]): string {
  return permissions.join(",");
}
