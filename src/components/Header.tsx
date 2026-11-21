'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Menu, X, PhoneCall, Sparkles } from 'lucide-react';
import { centerInfo } from '@/data/mockData';

interface HeaderProps {
  onEnrollClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onEnrollClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'О нас', href: '#about' },
    { name: 'Курсы', href: '#courses' },
    { name: 'Преподаватели', href: '#teachers' },
    { name: 'Результаты', href: '#results' },
    { name: 'Локация', href: '#location' },
    { name: 'Контакты', href: '#contacts' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070b14]/90 backdrop-blur-md border-b border-amber-500/20 py-3 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            className="flex items-center gap-3 group focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#hero');
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  AURA
                </span>
                <span className="text-xs uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/30">
                  Academy
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                Учебный центр высших баллов
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-slate-300 hover:text-amber-400 transition-colors py-1 relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
            ))}
          </nav>

          {/* Action buttons & phone */}
          <div className="hidden sm:flex items-center space-x-5">
            <a
              href={`tel:${centerInfo.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-amber-400 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">{centerInfo.phone}</span>
            </a>

            <button
              onClick={() => {
                if (onEnrollClick) onEnrollClick();
                handleNavClick('#enroll');
              }}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:shadow-lg hover:shadow-amber-500/25 hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Записаться</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => {
                if (onEnrollClick) onEnrollClick();
                handleNavClick('#enroll');
              }}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950"
            >
              Запись
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Открыть меню"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-amber-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#0a0f1d] border-b border-amber-500/20 px-6 py-5 shadow-2xl">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-base font-medium text-slate-200 hover:text-amber-400 py-1 border-b border-slate-800/80"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2 flex flex-col space-y-3">
              <a
                href={`tel:${centerInfo.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-2 text-sm text-slate-300"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span className="font-semibold">{centerInfo.phone}</span>
              </a>
              <button
                onClick={() => {
                  if (onEnrollClick) onEnrollClick();
                  handleNavClick('#enroll');
                }}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-center"
              >
                Записаться на курс
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
