import { requireProfile } from "@/lib/auth/guards";
import { AppShell } from "@/components/AppShell";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  return <AppShell profile={profile}>{children}</AppShell>;
}
