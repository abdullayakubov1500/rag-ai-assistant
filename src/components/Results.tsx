/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Trophy, Star, Quote, GraduationCap } from 'lucide-react';
import { studentResultsData, StudentResult } from '@/data/mockData';

export const Results: React.FC = () => {
  return (
    <section id="results" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Trophy className="w-3.5 h-3.5" />
            <span>Гордость центра</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Лучшие результаты <span className="gold-gradient-text">наших учеников</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Истории реальных ребят, которые превратили свои мечты о поступлении на бюджет в конкретный результат благодаря системной подготовке.
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {studentResultsData.map((student: StudentResult) => (
            <div
              key={student.id}
              className="p-7 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group"
            >
              {/* Background watermark quote icon */}
              <Quote className="absolute right-4 bottom-4 w-28 h-28 text-slate-800/30 pointer-events-none group-hover:text-amber-500/10 transition-colors" />

              <div>
                {/* Top Row: Avatar + Name + Score Badge */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md"
                    />
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        {student.name}
                      </h3>
                      <div className="text-xs text-amber-400 font-medium">
                        {student.course}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {student.year}
                      </div>
                    </div>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/20 shrink-0 text-center">
                    {student.score}
                  </div>
                </div>

                {/* Admission Info */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 mb-5 flex items-start gap-2.5">
                  <GraduationCap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="text-slate-400 block">Поступил(а) на бюджет:</span>
                    <strong className="text-white text-sm">{student.university}</strong>
                    <span className="text-slate-300 block text-[11px]">{student.faculty}</span>
                  </div>
                </div>

                {/* Testimonial Quote */}
                <p className="text-slate-300 text-sm leading-relaxed italic relative z-10">
                  «{student.quote}»
                </p>
              </div>

              {/* Stars rating */}
              <div className="flex items-center gap-1 mt-6 pt-4 border-t border-slate-800/70">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs text-slate-400 ml-2">Подтвержденный отзыв выпускника</span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
