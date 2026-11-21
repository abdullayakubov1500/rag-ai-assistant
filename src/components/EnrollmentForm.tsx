'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  Sparkles,
  User,
  Phone,
  Mail,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  X,
  Calendar,
  Clock,
  GraduationCap,
} from 'lucide-react';
import { coursesData } from '@/data/mockData';

interface EnrollmentFormProps {
  selectedCourseId?: string;
  onCourseChange?: (courseId: string) => void;
}

interface SlotDetail {
  time: string;
  bookedCount: number;
  maxCapacity: number;
  remainingSpots: number;
  available: boolean;
}

interface FreeSlotOption {
  date: string;
  dayOfWeek: string;
  teacher: string;
  availableTimes: string[];
  slotDetails?: SlotDetail[];
}

export const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
  selectedCourseId = 'math',
  onCourseChange,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    course: selectedCourseId,
    teacher: '',
    date: '',
    timeSlot: '',
    format: 'offline', // 'offline' | 'online'
    studyType: 'group', // 'group' | 'individual'
    comment: '',
  });

  const [freeSlots, setFreeSlots] = useState<FreeSlotOption[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submittedData, setSubmittedData] = useState<(typeof formData & { bookingId?: string }) | null>(
    null
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load free slots when date or teacher changes
  useEffect(() => {
    let cancelled = false;
    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        const params = new URLSearchParams();
        if (formData.date) params.set('date', formData.date);
        if (formData.teacher) params.set('teacher', formData.teacher);
        params.set('studyType', formData.studyType);
        const res = await fetch(`/api/enroll?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.slots)) {
          setFreeSlots(data.slots);
        }
      } catch {
        // ignore slot fetch errors silently
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };
    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [formData.date, formData.teacher, formData.studyType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'date' || name === 'teacher' || name === 'studyType' ? { timeSlot: '' } : {}),
    }));
    if (name === 'course' && onCourseChange) {
      onCourseChange(value);
    }
  };

  const getCourseTitle = (courseId: string) => {
    const found = coursesData.find((c) => c.id === courseId);
    return found ? found.title : courseId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg('Пожалуйста, укажите ваше имя и контактный номер телефона.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          course: getCourseTitle(formData.course),
          teacher: formData.teacher,
          date: formData.date,
          timeSlot: formData.timeSlot,
          format: formData.format,
          studyType: formData.studyType,
          comment: formData.comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Не удалось сохранить запись. Попробуйте еще раз.');
        return;
      }

      setSubmittedData({
        ...formData,
        bookingId: data.booking?.id,
      });
      setShowSuccessModal(true);

      setFormData({
        name: '',
        phone: '',
        email: '',
        course: selectedCourseId || 'math',
        teacher: '',
        date: '',
        timeSlot: '',
        format: 'offline',
        studyType: 'group',
        comment: '',
      });
    } catch {
      setErrorMsg('Ошибка соединения с сервером. Проверьте сеть и попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueTeachers = Array.from(new Set(freeSlots.map((s) => s.teacher)));
  const slotDetailsMap = new Map<string, SlotDetail>();
  for (const s of freeSlots) {
    if (formData.date && s.date !== formData.date) continue;
    if (formData.teacher && s.teacher !== formData.teacher) continue;
    for (const d of s.slotDetails || []) {
      if (!d.available) continue;
      const existing = slotDetailsMap.get(d.time);
      if (!existing || d.remainingSpots > existing.remainingSpots) {
        slotDetailsMap.set(d.time, d);
      }
    }
  }
  const availableTimesForSelection = Array.from(slotDetailsMap.values()).sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  return (
    <section id="enroll" className="py-20 lg:py-28 relative bg-[#090e1b] border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Онлайн запись</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
              Запишитесь на <span className="gold-gradient-text">бесплатный пробный урок</span>
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Заявка автоматически регистрируется в системе расписания и закрепляет за вами выбранное свободное окно.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10 text-left">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Ваше имя или имя ученика *
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Иван Иванов"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Номер телефона *
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+998 (90) 000-00-00"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Электронная почта
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      placeholder="ivanov@mail.ru"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Course Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Выберите курс *
                  </label>
                  <div className="relative">
                    <BookOpen className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm appearance-none cursor-pointer"
                    >
                      {coursesData.map((course) => (
                        <option key={course.id} value={course.id} className="bg-slate-900 text-white">
                          {course.categoryLabel} — {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Teacher, Date & Free Time Slot */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Преподаватель (необязательно)
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <select
                      name="teacher"
                      value={formData.teacher}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900">
                        Любой свободный
                      </option>
                      {uniqueTeachers.map((t) => (
                        <option key={t} value={t} className="bg-slate-900">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Желаемая дата
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Свободное время {loadingSlots ? '(поиск...)' : ''}
                  </label>
                  <div className="relative">
                    <Clock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <select
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900">
                        По согласованию
                      </option>
                      {availableTimesForSelection.map((slot) => (
                        <option key={slot.time} value={slot.time} className="bg-slate-900">
                          {formData.studyType === 'group'
                            ? `${slot.time} — свободно ${slot.remainingSpots} из ${slot.maxCapacity} мест`
                            : `${slot.time} (свободно 1 на 1)`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Study Type selection: Group up to 12 vs Individual */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Тип обучения
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.studyType === 'group'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="studyType"
                      value="group"
                      checked={formData.studyType === 'group'}
                      onChange={handleChange}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-semibold block text-sm">Групповое обучение (до 12 человек)</span>
                      <span className="text-xs text-slate-400">Командная работа и разбор задач в группе</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.studyType === 'individual'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="studyType"
                      value="individual"
                      checked={formData.studyType === 'individual'}
                      onChange={handleChange}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-semibold block text-sm">Индивидуальное (1 на 1)</span>
                      <span className="text-xs text-slate-400">Персональный график с преподавателем</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Format selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Удобный формат занятий
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.format === 'offline'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value="offline"
                      checked={formData.format === 'offline'}
                      onChange={handleChange}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-semibold block text-sm">Офлайн в кампусе</span>
                      <span className="text-xs text-slate-400">Очные занятия в аудиториях</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.format === 'online'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value="online"
                      checked={formData.format === 'online'}
                      onChange={handleChange}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-semibold block text-sm">Онлайн обучение</span>
                      <span className="text-xs text-slate-400">Интерактивная платформа и живые трансляции</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Комментарий или текущий класс ученика (по желанию)
                </label>
                <div className="relative">
                  <MessageSquare className="w-5 h-5 text-slate-500 absolute left-4 top-4" />
                  <textarea
                    name="comment"
                    rows={3}
                    placeholder="Например: 10 класс, хотим сдать ЕГЭ на 90+ и подтянуть геометрию"
                    value={formData.comment}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Submit Button & Privacy */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Запись сохраняется напрямую в Google Таблицу центра</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:shadow-xl hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-base cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  <span>{isSubmitting ? 'Сохранение записи...' : 'Отправить заявку на урок'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && submittedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#0b132b] border border-amber-500/40 shadow-2xl text-left">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2">
              Запись успешно добавлена в таблицу!
            </h3>

            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Спасибо, <strong className="text-white">{submittedData.name}</strong>! Заявка зарегистрирована
              {submittedData.bookingId ? ` под номером ${submittedData.bookingId}` : ''}. Куратор свяжется с вами по номеру{' '}
              <strong className="text-amber-400">{submittedData.phone}</strong>.
            </p>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 mb-6">
              <div className="text-slate-400">
                Курс: <span className="text-white font-medium">{getCourseTitle(submittedData.course)}</span>
              </div>
              {submittedData.teacher && (
                <div className="text-slate-400">
                  Преподаватель: <span className="text-white font-medium">{submittedData.teacher}</span>
                </div>
              )}
              {(submittedData.date || submittedData.timeSlot) && (
                <div className="text-slate-400">
                  Дата и время:{' '}
                  <span className="text-amber-400 font-medium">
                    {submittedData.date || 'По согласованию'} {submittedData.timeSlot || ''}
                  </span>
                </div>
              )}
              <div className="text-slate-400">
                Формат: <span className="text-white font-medium">{submittedData.format === 'offline' ? 'Офлайн' : 'Онлайн'}</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3.5 rounded-xl font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors text-center"
            >
              Понятно, спасибо
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
