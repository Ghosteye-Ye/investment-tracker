// layouts/DefaultLayout.tsx
import type { ReactNode } from "react";

export default function DefaultLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen font-sans text-gray-900 bg-white">
      {/* 可以放 Header / Footer */}
      {children}
    </div>
  );
}
