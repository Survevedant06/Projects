'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Bookmark, PlusCircle, Coffee, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Explore', icon: Compass },
    { href: '/lists', label: 'Curated Lists', icon: Sparkles },
    { href: '/saved', label: 'Saved', icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-40 bg-nomad-navy-950/85 backdrop-blur-md border-b border-nomad-navy-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-nomad-teal-600 text-white flex items-center justify-center shadow-teal-glow group-hover:scale-105 transition-transform duration-200">
              <Coffee className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-black text-lg tracking-tight text-nomad-sand-50 leading-none">
                Nomad<span className="text-nomad-teal-400">Spot</span>
              </span>
              <span className="text-[10px] text-nomad-muted-dark font-medium tracking-wide uppercase mt-0.5">
                Work-Ready Directory
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-nomad-navy-800 text-nomad-teal-400 border border-nomad-navy-700 shadow-sm'
                      : 'text-nomad-sand-300 hover:text-nomad-sand-50 hover:bg-nomad-navy-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA & Submit */}
          <div className="flex items-center gap-3">
            <Link
              href="/submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-nomad-teal-600 hover:bg-nomad-teal-500 text-white shadow-teal-glow hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Workspace</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
