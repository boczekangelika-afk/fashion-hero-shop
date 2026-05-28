'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') return null;

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  const linkClass = (href: string) =>
    `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
      pathname.startsWith(href)
        ? 'bg-gray-900 text-white'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          FashionHero <span className="text-gray-400 font-normal">Admin</span>
        </span>
        <nav className="flex items-center gap-1">
          <Link href="/admin/sellers" className={linkClass('/admin/sellers')}>
            Sprzedawcy
          </Link>
          <Link href="/admin/history" className={linkClass('/admin/history')}>
            Historia
          </Link>
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        Wyloguj
      </button>
    </header>
  );
}

