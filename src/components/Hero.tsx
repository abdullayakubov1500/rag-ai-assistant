/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, Award, Users, Star, GraduationCap } from 'lucide-react';
import { centerInfo } from '@/data/mockData';

export const Hero: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background radial glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold mb-6">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Набор на сезон 2024–2025 открыт</span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="hidden sm:inline text-slate-300">Мини-группы до 8 человек</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
              Учебный центр <br />
              <span className="gold-gradient-text">высших академических</span> результатов
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-8">
              {centerInfo.description} Экспертная подготовка к <strong className="text-white">ЕГЭ</strong>, <strong className="text-white">ОГЭ</strong> и <strong className="text-white">олимпиадам</strong> по математике, английскому и информатике с гарантией результата по договору.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <button
                onClick={() => scrollTo('#enroll')}
                className="px-8 py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:shadow-xl hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-base cursor-pointer"
              >
                <span>Записаться на пробный урок</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => scrollTo('#courses')}
                className="px-8 py-4 rounded-xl font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/40 hover:text-white transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                <span>Выбрать курс</span>
              </button>
            </div>

            {/* Quick trust checkmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Бесплатное входное тестирование уровня</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Преподаватели — авторы методик и члены жюри</span>
              </div>
            </div>
          </div>

          {/* Right Image Showcase Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative gold frame */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-amber-500/30 to-blue-600/20 blur-xl opacity-75" />

              {/* Main Photo Card */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop"
                  alt="Атмосфера занятий в учебном центре AURA"
                  className="w-full h-[420px] sm:h-[480px] object-cover hover:scale-105 transition-transform duration-700"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Floating caption on bottom of image */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm sm:text-base">Кампус в «Москва-Сити»</p>
                      <p className="text-xs text-slate-300">Светлые технологичные аудитории и зона коворкинга</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1 - Top Left */}
              <div className="absolute -top-5 -left-5 bg-[#0f172a]/95 backdrop-blur-md border border-amber-500/30 rounded-2xl p-3 shadow-xl hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Гарантия результата</div>
                  <div className="text-sm font-bold text-white">Договор с гарантией</div>
                </div>
              </div>

              {/* Floating Badge 2 - Bottom Right */}
              <div className="absolute -bottom-6 -right-5 bg-[#0f172a]/95 backdrop-blur-md border border-amber-500/30 rounded-2xl p-3 shadow-xl hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Мини-группы</div>
                  <div className="text-sm font-bold text-white">До 8 человек</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Stats Row */}
        <div className="mt-16 pt-10 border-t border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {centerInfo.stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-amber-500/30 transition-all text-left"
            >
              <div className="text-3xl sm:text-4xl font-extrabold gold-gradient-text tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-sm sm:text-base font-semibold text-white mb-0.5">
                {stat.label}
              </div>
              <div className="text-xs text-slate-400">
                {stat.sublabel}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
