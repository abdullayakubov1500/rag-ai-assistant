'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  FileText,
  User,
  Loader2,
  MessageSquare,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

interface RetrievedChunkMeta {
  id: string;
  source: string;
  title: string;
  similarityPercent: number;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: string[];
  retrievedChunks?: RetrievedChunkMeta[];
  isError?: boolean;
}

const STARTER_QUESTIONS = [
  'Какие свободные окна есть на ближайшие дни?',
  'Сколько стоит курс IELTS и есть ли рассрочка?',
  'Когда принимает Александр Воронов?',
  'Что нужно взять на первый урок?',
];

const SOURCE_LABELS: Record<string, string> = {
  'price_list.md': 'Прайс-лист',
  'price_list.docx': 'Прайс-лист (DOCX)',
  'faq.md': 'FAQ',
  'faq.docx': 'FAQ (DOCX)',
  'schedule.md': 'График работы',
  'schedule.xlsx': 'График (Excel)',
};

export const RagAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Здравствуйте! Я AI-консультант учебного центра «AURA Academy» на базе Gemini 3.5 Flash Lite.\n\nЗадайте мне любой вопрос о ценах и рассрочке, расписании преподавателей, правилах записи, переносе занятий или контактах центра.',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const msgCounterRef = useRef(0);

  const nextId = (prefix: string) => {
    msgCounterRef.current += 1;
    return `${prefix}-${msgCounterRef.current}`;
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend?: string) => {
    const trimmed = (textToSend ?? input).trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: nextId('u'),
      role: 'user',
      text: trimmed,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const historyPayload = updatedMessages
        .filter((m) => m.id !== 'welcome' && !m.isError)
        .slice(0, -1)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId('e'),
            role: 'model',
            text: data.error || 'Произошла ошибка при получении ответа.',
            isError: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId('m'),
            role: 'model',
            text: data.reply,
            sources: data.sources,
            retrievedChunks: data.retrievedChunks,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId('e'),
          role: 'model',
          text: 'Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/rag/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId('s'),
            role: 'model',
            text: `База знаний синхронизирована с Google Диском! Загружено актуальных чанков: ${data.totalChunks}.`,
            sources: data.updatedSources,
          },
        ]);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'Чат очищен. Спрашивайте о курсах, ценах в сумах, расписании преподавателей или условиях обучения!',
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2.5rem)] sm:w-[410px] h-[560px] max-h-[80vh] rounded-3xl bg-[#0b132b]/95 backdrop-blur-xl border border-amber-500/35 shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#0f172a] to-[#16213e] border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
                <Bot className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">AI-Ассистент AURA</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                    RAG
                  </span>
                </div>
                <div className="text-[11px] text-amber-400/90 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>gemini-3.5-flash-lite</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                title="Обновить базу знаний с Google Диска"
                className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              </button>
              <button
                onClick={handleReset}
                title="Очистить историю"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Закрыть чат"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-sm'
                      : msg.isError
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-tl-sm'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-sm'
                  }`}
                >
                  {msg.text}

                  {/* Source badges */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Источники:</span>
                      {msg.sources.map((src) => {
                        const topChunk = msg.retrievedChunks?.find((c) => c.source === src);
                        return (
                          <span
                            key={src}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-[10px] text-amber-300"
                          >
                            <FileText className="w-2.5 h-2.5" />
                            {SOURCE_LABELS[src] || src}
                            {topChunk ? ` (${topChunk.similarityPercent}%)` : ''}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-slate-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Ищу ответ в базе знаний...</span>
                </div>
              </div>
            )}

            {/* Starter quick prompts shown when chat has only welcome message */}
            {messages.length === 1 && !isLoading && (
              <div className="pt-2 space-y-2">
                <div className="text-[11px] text-slate-400 font-medium">
                  Популярные вопросы:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-left text-[11px] px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-[#090e1b] border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Спросите о курсах, ценах, графике..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Отправить сообщение"
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-105 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Открыть AI-ассистента"
        className="group flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 font-bold shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        {isOpen ? (
          <>
            <X className="w-5 h-5 stroke-[2.5]" />
            <span className="text-sm">Свернуть чат</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-5 h-5 stroke-[2.5]" />
            <span className="text-sm">AI-Консультант</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          </>
        )}
      </button>
    </div>
  );
};
