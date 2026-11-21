/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Award, Briefcase, GraduationCap, Trophy, Sparkles, Star } from 'lucide-react';
import { teachersData, Teacher } from '@/data/mockData';

export const Teachers: React.FC = () => {
  return (
    <section id="teachers" className="py-20 lg:py-28 relative bg-[#090e1b] border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Преподавательский состав</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Наставники с подтвержденным <span className="gold-gradient-text">авторитетом</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            У нас преподают авторы учебников, члены жюри всероссийских олимпиад и эксперты предметных комиссий ЕГЭ с многолетним практическим стажем.
          </p>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {teachersData.map((teacher: Teacher) => (
            <div
              key={teacher.id}
              className="flex flex-col rounded-3xl overflow-hidden bg-slate-900/85 border border-slate-800 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 text-left"
            >
              {/* Photo & Main Badge */}
              <div className="relative h-72 sm:h-80 overflow-hidden bg-slate-950">
                <img
                  src={teacher.photo}
                  alt={teacher.name}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Experience Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
                    <Briefcase className="w-3.5 h-3.5" />
                    {teacher.experience}
                  </span>
                </div>

                {/* Name & Subject over gradient */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-xs font-semibold text-amber-400 mb-0.5">
                    {teacher.subject}
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    {teacher.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {teacher.role}
                  </p>
                </div>
              </div>

              {/* Teacher Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Education */}
                  <div className="mb-5 pb-5 border-b border-slate-800">
                    <div className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <GraduationCap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white font-semibold block mb-0.5">Образование:</span>
                        {teacher.education}
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="mb-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5">
                      <Award className="w-4 h-4" />
                      <span>Ключевые достижения:</span>
                    </div>
                    <ul className="space-y-2">
                      {teacher.achievements.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Student Results Section */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                    <Trophy className="w-4 h-4" />
                    <span>Результаты учеников:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Средний балл:</span>
                      <span className="text-base font-extrabold text-amber-400">{teacher.studentResults.avgScore}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Максимум:</span>
                      <span className="text-base font-extrabold text-emerald-400">{teacher.studentResults.maxScore}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-300 font-medium">Поступления:</span> {teacher.studentResults.topUniversities.join(', ')}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
