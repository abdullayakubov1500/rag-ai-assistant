'use client';

import React from 'react';
import { Phone, Mail, Clock, MessageCircle, Send, Sparkles } from 'lucide-react';
import { centerInfo } from '@/data/mockData';

export const Contacts: React.FC = () => {
  return (
    <section id="contacts" className="py-20 lg:py-28 relative bg-[#090e1b] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Связь с нами</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Контакты и <span className="gold-gradient-text">консультации</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Мы всегда готовы ответить на ваши вопросы, рассчитать стоимость и организовать пробное тестирование.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          {/* Card 1: Phone */}
          <div className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Телефоны</h3>
              <p className="text-xs text-slate-400 mb-4">Ежедневно с 09:00 до 21:00</p>
              
              <div className="space-y-1.5">
                <a
                  href={`tel:${centerInfo.phone.replace(/[^0-9+]/g, '')}`}
                  className="block text-base font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {centerInfo.phone}
                </a>
                <a
                  href={`tel:${centerInfo.phoneSecondary.replace(/[^0-9+]/g, '')}`}
                  className="block text-xs text-slate-300 hover:text-white transition-colors"
                >
                  {centerInfo.phoneSecondary} (Бесплатно по РФ)
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Email */}
          <div className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Электронная почта</h3>
              <p className="text-xs text-slate-400 mb-4">Для вопросов и документов</p>
              
              <a
                href={`mailto:${centerInfo.email}`}
                className="text-base font-bold text-amber-400 hover:text-amber-300 transition-colors break-all"
              >
                {centerInfo.email}
              </a>
            </div>
          </div>

          {/* Card 3: Messengers */}
          <div className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Мессенджеры</h3>
              <p className="text-xs text-slate-400 mb-4">Быстрый ответ дежурного куратора</p>
              
              <div className="flex flex-col gap-2">
                <a
                  href={centerInfo.socials.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Telegram (@aura_academy)</span>
                </a>
                <a
                  href={centerInfo.socials.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp чат</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 4: Working hours */}
          <div className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Режим работы</h3>
              <p className="text-xs text-slate-400 mb-3">Очные занятия и консультации</p>
              
              <div className="text-xs text-slate-300 space-y-1">
                <div className="font-medium text-white">{centerInfo.workingHours.weekdays}</div>
                <div>{centerInfo.workingHours.weekend}</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
