'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, User, Shield } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span>HeyZo</span>
            </Link>
            
            <div className="flex space-x-1">
              <Link
                href="/user"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  pathname === '/user'
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>User Dashboard</span>
              </Link>
              
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  pathname === '/admin'
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
