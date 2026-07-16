export function NoAccess({ section }: { section: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-lg font-semibold text-zinc-900">Not authorized</h1>
        <p className="mt-1 text-sm text-zinc-500">
          You don&apos;t have access to {section}. Ask an admin to grant it.
        </p>
      </div>
    </div>
  );
}
