import SuperAdminShell from "@/components/super-admin/SuperAdminShell";

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SuperAdminShell>{children}</SuperAdminShell>;
}
