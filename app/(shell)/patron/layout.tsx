import { requireRole } from "@/lib/auth/guards";

export default async function PatronLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("patron");
  return <>{children}</>;
}
