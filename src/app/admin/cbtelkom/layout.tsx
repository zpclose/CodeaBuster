
import { Sidebar } from './components/Sidebar';

export default function AdminCbtelkomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is intentionally simple and does not perform any auth checks.
  // Access is controlled by the "secret" URL.
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-muted/40 p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}
