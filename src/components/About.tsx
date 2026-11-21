/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { ShieldCheck, Users, MonitorPlay, FileCheck, CheckCircle, Sparkles, Building2 } from 'lucide-react';
import { centerInfo, aboutFeatures } from '@/data/mockData';

export const About: React.FC = () => {
  const iconMap: Record<string, React.ReactNode> = {
    ShieldCheck: <ShieldCheck className="w-6 h-6 text-amber-400" />,
    Users: <Users className="w-6 h-6 text-amber-400" />,
    MonitorPlay: <MonitorPlay className="w-6 h-6 text-amber-400" />,
    FileCheck: <FileCheck className="w-6 h-6 text-amber-400" />,
  };

  return (
    <section id="about" className="py-20 lg:py-28 relative bg-[#090e1b] border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>О нашем центре</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-5">
            Создаем образовательную среду, где <span className="gold-gradient-text">раскрывается потенциал</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Мы основали {centerInfo.name} в {centerInfo.founded} году с одной главной целью: дать школьникам возможность учиться с искренним интересом, понимать суть предметов и поступать в лучшие университеты мира без стресса и выгорания.
          </p>
        </div>

        {/* 2-Column Story & Atmosphere */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          
          {/* Images collage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl group">
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop"
                  alt="Индивидуальный подход преподавателя"
                  className="w-full h-52 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/20 text-left">
                <div className="text-2xl font-black text-amber-400 mb-1">7+ лет</div>
                <p className="text-xs text-slate-300">Успешного опыта подготовки к олимпиадам и поступлению</p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/60 text-left">
                <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Премиум локация</span>
                </div>
                <p className="text-xs text-slate-400">Панорамный вид на город, кондиционирование и тихие зоны</p>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl group">
                <img
                  src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop"
                  alt="IT-хаб и практические занятия"
                  className="w-full h-52 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Narrative Content */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Почему 9 из 10 учеников рекомендуют нас друзьям:
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3.5">
                <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold text-base">Индивидуальная образовательная траектория</h4>
                  <p className="text-sm text-slate-300">Перед стартом обучения проводим комплексную диагностику знаний, определяем пробелы и выстраиваем персональный план на весь учебный год.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold text-base">Никаких скучных лекций — только интерактив</h4>
                  <p className="text-sm text-slate-300">80% времени занятий посвящено решению задач, живому кодингу, проектным кейсам и дебатам на английском языке.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold text-base">Психологическая устойчивость на экзаменах</h4>
                  <p className="text-sm text-slate-300">Учим школьников тайм-менеджменту и методам концентрации, проводим тренировочные экзамены в обстановке реального бланкового тестирования.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 text-xs sm:text-sm">
              <strong className="text-amber-400">Официальная лицензия № 77-04821:</strong> Все программы согласованы с требованиями ФИПИ и Министерства образования РФ. Доступен налоговый вычет 13% и оплата материнским капиталом.
            </div>
          </div>

        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aboutFeatures.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 text-left shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                {iconMap[item.icon] || <CheckCircle className="w-6 h-6 text-amber-400" />}
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
