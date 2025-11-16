'use client';

import { Bell, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Header() {
  const currentDate = new Date();
  const formattedDate = format(currentDate, 'EEEE MM/dd/yyyy');

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-6">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-3 gap-1 w-4 h-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-blue-600 rounded-sm" />
          ))}
        </div>
        <span className="text-base md:text-lg font-semibold text-gray-800">DREAMY SOFTWARE</span>
      </div>

      {/* Right side icons and date */}
      <div className="flex items-center gap-2 md:gap-4">
        <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <Bell size={18} className="text-gray-600" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-gray-600">
          <Calendar size={18} />
          <span className="text-xs md:text-sm font-medium">{formattedDate}</span>
        </div>
      </div>
    </header>
  );
}

