
import { Navbar } from "@/components/Navbar/Navbar";
import { Toaster } from 'sonner';
import AuthGuard from "@/components/AuthGuard";

export default function UserManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div>
        <Navbar />
        <main>{children}</main>
        <Toaster />
      </div>
    </AuthGuard>
  );
}
