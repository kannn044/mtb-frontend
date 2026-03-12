
import { Navbar } from "@/components/Navbar/Navbar";
import AuthGuard from "@/components/AuthGuard";

export default function UploadLayout({
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
