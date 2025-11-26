import { Header } from "./Header";
import { Footer } from "./Footer";

interface StoreLayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
}

export function StoreLayout({ children, onSearch }: StoreLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header onSearch={onSearch} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
