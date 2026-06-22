import type { ReactNode } from 'react';

// Root layout: a child `[locale]` layout provides <html> and <body> (see next-intl routing).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
