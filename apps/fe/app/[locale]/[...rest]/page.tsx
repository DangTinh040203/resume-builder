import { notFound } from 'next/navigation';

// Catch-all for unmatched routes under a locale so Next.js renders our custom
// not-found UI (app/[locale]/not-found.tsx) instead of its default 404 page.
export default function CatchAllPage() {
  notFound();
}
