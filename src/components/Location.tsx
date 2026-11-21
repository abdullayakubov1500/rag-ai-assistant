'use client';

import React from 'react';
import { MapPin, Navigation, Car, Clock, Sparkles, Train } from 'lucide-react';
import { centerInfo } from '@/data/mockData';

export const Location: React.FC = () => {
  return (
    <section id="location" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Геолокация и адрес</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Удобное расположение в самом <span className="gold-gradient-text">сердце столицы</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Наш кампус расположен в Деловом центре «Москва-Сити». Современные аудитории, панорамные виды и максимальная транспортная доступность.
          </p>
        </div>

        {/* Map & Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Info Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-left h-full flex flex-col justify-between">
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      Адрес учебного центра
                    </span>
                    <h3 className="text-lg font-bold text-white leading-snug">
                      {centerInfo.address}
                    </h3>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-4 text-sm">
                  
                  <div className="flex items-start gap-3 text-slate-300">
                    <Train className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">{centerInfo.metro}</strong>
                      <span className="text-xs text-slate-400">{centerInfo.walkTime} по теплому подземному переходу</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-slate-300">
                    <Car className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Парковка для родителей и учеников</strong>
                      <span className="text-xs text-slate-400">{centerInfo.parking}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-slate-300">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">График работы кампуса</strong>
                      <span className="text-xs text-slate-400">{centerInfo.workingHours.weekdays}</span>
                      <span className="text-xs text-slate-400 block">{centerInfo.workingHours.weekend}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-6 border-t border-slate-800 mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://yandex.ru/maps/-/CDuW7KnV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Построить маршрут</span>
                </a>
              </div>

            </div>
          </div>

          {/* Right Interactive Map Frame */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative min-h-[400px] lg:min-h-[460px] bg-slate-950">
            {/* OpenStreetMap iframe with pin on Moscow-City / Presnenskaya Embankment */}
            <iframe
              title="Интерактивная карта учебного центра"
              src="https://www.openstreetmap.org/export/embed.html?bbox=37.53100%2C55.74500%2C37.54500%2C55.75300&layer=mapnik&marker=55.74950%2C37.53750"
              className="w-full h-full min-h-[400px] border-0 filter contrast-[1.05] brightness-[0.9]"
              loading="lazy"
            />
            
            {/* Overlay badge on the map */}
            <div className="absolute top-4 left-4 p-3 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-amber-500/30 text-left shadow-xl pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Кампус AURA Academy открыт</span>
              </div>
              <span className="text-[11px] text-amber-400">Башня Федерация Восток, 14 этаж</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
