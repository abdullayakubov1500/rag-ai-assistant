'use client';

import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
import { centerInfo } from '@/data/mockData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05080f] border-t border-slate-800 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 text-left">
          
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                AURA <span className="text-amber-400">ACADEMY</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-sm mb-4 leading-relaxed">
              {centerInfo.description}
            </p>
            <p className="text-[11px] text-slate-400">
              Лицензия на осуществление образовательной деятельности № 77-04821 от 14.05.2019 г.
            </p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3">
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
              Навигация
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#about" className="hover:text-amber-400 transition-colors">О центре</a></li>
              <li><a href="#courses" className="hover:text-amber-400 transition-colors">Курсы (Математика, Английский, IT)</a></li>
              <li><a href="#teachers" className="hover:text-amber-400 transition-colors">Преподаватели</a></li>
              <li><a href="#results" className="hover:text-amber-400 transition-colors">Результаты и отзывы</a></li>
              <li><a href="#location" className="hover:text-amber-400 transition-colors">Геолокация и схема проезда</a></li>
              <li><a href="#enroll" className="hover:text-amber-400 transition-colors">Запись на пробный урок</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-4">
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
              Официально
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              ООО «Аура Академия Знаний»<br />
              ОГРН: 1197746328190 | ИНН: 7703482190<br />
              {centerInfo.address}
            </p>
            <div className="flex gap-4 text-[11px]">
              <a href="#hero" className="hover:text-white transition-colors underline">Политика конфиденциальности</a>
              <a href="#hero" className="hover:text-white transition-colors underline">Договор оферты</a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2025 {centerInfo.name}. Все права защищены.</p>
          <p className="flex items-center gap-1 text-[11px]">
            Разработано с заботой об образовании будущего <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline" />
          </p>
        </div>

      </div>
    </footer>
  );
};
