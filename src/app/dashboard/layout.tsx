
import { Navbar } from "@/components/Navbar/Navbar";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div>
        <Navbar />
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}
