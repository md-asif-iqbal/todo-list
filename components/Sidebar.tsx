'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, User, LogOut } from 'lucide-react';
import { getStoredUser, clearAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const handleNavClick = () => {
    if (onNavigate && typeof window !== 'undefined' && window.innerWidth < 768) {
      onNavigate();
    }
  };

  const navItems = [
    { href: '/todos', label: 'Todos', icon: CheckSquare },
    { href: '/profile', label: 'Account Information', icon: User },
  ];

  return (
    <aside className="flex w-64 bg-[#1e3a5f] min-h-screen flex-col">
      {/* User Profile */}
      <div className="p-6 border-b border-[#2a4d73]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-400 mb-3 flex items-center justify-center overflow-hidden">
            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={user.firstName || 'User'}
                width={64}
                height={64}
                className="object-cover"
              />
            ) : (
              <span className="text-white text-xl font-semibold">
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <p className="text-white font-medium text-sm">
            {user?.firstName?.toLowerCase() || 'user'}
          </p>
          <p className="text-gray-300 text-xs mt-1">
            {user?.email || 'user@example.com'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#2a5d8f] text-white'
                      : 'text-gray-300 hover:bg-[#2a4d73] hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#2a4d73]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#2a4d73] hover:text-white transition-colors w-full"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

