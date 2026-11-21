/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { Calculator, Languages, Code2, Check, ArrowRight, Clock, Users, Calendar, Sparkles } from 'lucide-react';
import { coursesData, Course } from '@/data/mockData';

interface CoursesProps {
  onSelectCourse: (courseId: string) => void;
}

export const Courses: React.FC<CoursesProps> = ({ onSelectCourse }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'math' | 'english' | 'cs'>('all');

  const filteredCourses = activeCategory === 'all'
    ? coursesData
    : coursesData.filter((c) => c.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'math':
        return <Calculator className="w-5 h-5 text-amber-400" />;
      case 'english':
        return <Languages className="w-5 h-5 text-amber-400" />;
      case 'cs':
        return <Code2 className="w-5 h-5 text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <section id="courses" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Направления обучения</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Программы подготовки <span className="gold-gradient-text">нового поколения</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Фундаментальное освоение ключевых дисциплин: от надежной базы до 100 баллов на ЕГЭ и побед на олимпиадах.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Все направления (3)
            </button>
            <button
              onClick={() => setActiveCategory('math')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeCategory === 'math'
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Математика</span>
            </button>
            <button
              onClick={() => setActiveCategory('english')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeCategory === 'english'
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Languages className="w-4 h-4" />
              <span>Английский язык</span>
            </button>
            <button
              onClick={() => setActiveCategory('cs')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeCategory === 'cs'
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Информатика и IT</span>
            </button>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course: Course) => (
            <div
              key={course.id}
              className="flex flex-col rounded-3xl overflow-hidden bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 group"
            >
              {/* Course Top Image & Badge */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                    {getCategoryIcon(course.category)}
                    {course.categoryLabel}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="inline-block text-[11px] font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                    {course.badge}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between text-left">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Metadata Tags */}
                  <div className="space-y-2 mb-6 pb-6 border-b border-slate-800 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{course.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{course.groupSize}</span>
                    </div>
                  </div>

                  {/* Program Features */}
                  <div className="space-y-2.5 mb-8">
                    <div className="text-xs uppercase font-bold text-amber-400 tracking-wider mb-2">
                      Что входит в программу:
                    </div>
                    {course.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer with Price and Action */}
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-xs text-slate-400 block">Стоимость:</span>
                      <span className="text-2xl font-black text-white">{course.price}</span>
                    </div>
                    <span className="text-xs text-slate-400">{course.pricePeriod}</span>
                  </div>

                  <button
                    onClick={() => onSelectCourse(course.id)}
                    className="w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <span>Записаться на курс</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
