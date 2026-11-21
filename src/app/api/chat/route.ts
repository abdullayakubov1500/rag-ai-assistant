import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, type FunctionDeclaration, type Content } from '@google/genai';
import {
  syncAndLoadKnowledgeBase,
  retrieveRelevantChunks,
  getEmbeddingModelName,
} from '@/lib/googleRagEngine';
import { findFreeSlots, bookStudentToSheet } from '@/lib/googleSheetsBooking';

const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || 'gemini-3.5-flash-lite';

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

const findFreeSlotsDecl: FunctionDeclaration = {
  name: 'find_free_slots',
  description:
    'Находит свободные окна (даты и время) для записи студентов к преподавателям учебного центра на основе их графика работы и текущих записей в Google Таблице.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      date: {
        type: Type.STRING,
        description:
          'Дата в формате YYYY-MM-DD (например, 2026-11-23). Если не указана, проверяются ближайшие 4 дня.',
      },
      teacher: {
        type: Type.STRING,
        description:
          'Имя или фамилия преподавателя (например, Воронов, Смирнова, Ковалёв, Каримова, Петя Петров). Если не указано, проверяются все работающие в этот день преподаватели.',
      },
      studyType: {
        type: Type.STRING,
        description:
          'Тип обучения: "group" для группового обучения (до 12 человек в одном окне, по умолчанию) или "individual" для индивидуального занятия 1 на 1.',
      },
    },
  },
};

const bookStudentDecl: FunctionDeclaration = {
  name: 'book_student',
  description:
    'Записывает студента в Google Таблицу «Записи». Вызывай эту функцию только когда известны минимум: имя ученика, телефон и курс (или направление). Если указаны преподаватель, дата и время — проверяет, что окно свободно, и бронирует его.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      studentName: {
        type: Type.STRING,
        description: 'Имя и фамилия студента.',
      },
      phone: {
        type: Type.STRING,
        description: 'Контактный номер телефона студента или родителя.',
      },
      course: {
        type: Type.STRING,
        description: 'Название курса или направления (например: Математика, Английский, IELTS, Python).',
      },
      teacher: {
        type: Type.STRING,
        description: 'ФИО преподавателя (необязательно).',
      },
      date: {
        type: Type.STRING,
        description: 'Дата занятия в формате YYYY-MM-DD (необязательно).',
      },
      timeSlot: {
        type: Type.STRING,
        description: 'Время начала в формате HH:MM (например, 15:00).',
      },
      format: {
        type: Type.STRING,
        description: 'Формат обучения: Офлайн или Онлайн.',
      },
      studyType: {
        type: Type.STRING,
        description:
          'Тип обучения: "group" — групповое обучение (до 12 человек на одно время, по умолчанию) или "individual" — индивидуальное занятие.',
      },
      email: {
        type: Type.STRING,
        description: 'Email (необязательно).',
      },
      comment: {
        type: Type.STRING,
        description: 'Дополнительный комментарий (необязательно).',
      },
    },
    required: ['studentName', 'phone', 'course'],
  },
};

async function generateWithRetry(
  ai: GoogleGenAI,
  contents: Content[],
  systemInstruction: string
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await ai.models.generateContent({
        model: CHAT_MODEL,
        contents,
        config: {
          systemInstruction,
          temperature: 0.2,
          maxOutputTokens: 2048,
          tools: [{ functionDeclarations: [findFreeSlotsDecl, bookStudentDecl] }],
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      const isTransient = msg.includes('503') || msg.includes('429') || msg.includes('UNAVAILABLE');
      if (!isTransient || attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error('Gemini API не ответил после 3 попыток.');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = (body?.message || '').trim();
    const history: ChatHistoryItem[] = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
      return NextResponse.json(
        { error: 'Сообщение не может быть пустым.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Не задан GEMINI_API_KEY. Добавьте GEMINI_API_KEY в файл .env.local в корне проекта и перезапустите сервер.',
        },
        { status: 500 }
      );
    }

    // Step 1: Sync & load fresh RAG chunks from Google Drive
    const syncResult = await syncAndLoadKnowledgeBase(apiKey);
    const knowledgeBase = syncResult.chunks;

    // Step 2: Vector retrieval via Cosine Similarity
    const retrievedChunks = await retrieveRelevantChunks(message, knowledgeBase, apiKey, 8);

    const contextText = retrievedChunks
      .map(
        (c, i) =>
          `[Источник ${i + 1}: ${c.title} | Файл: ${c.source} | Релевантность: ${c.similarityPercent}%]\n${c.text}`
      )
      .join('\n\n---\n\n');

    const todayStr = new Date().toISOString().slice(0, 10);

    const systemInstruction = `Ты — интеллектуальный AI-консультант и администратор учебного центра «AURA Academy». Сегодняшняя дата: ${todayStr}.
Твои задачи:
1. Отвечать на вопросы учеников и родителей на русском языке, опираясь СТРОГО на актуальный КОНТЕКСТ ИЗ БАЗЫ ЗНАНИЙ (прайс-лист, FAQ, график работы преподавателей на Google Диске).
2. Если пользователь спрашивает про свободные окна, доступное время для записи или хочет записаться:
   - В центре доступно **групповое обучение (до 12 человек в группе на одно время)** и **индивидуальное обучение (1 на 1)**.
   - Используй инструмент \`find_free_slots\`, чтобы проверить реальные свободные окна и количество оставшихся мест в группе (из 12).
   - Когда пользователь хочет записать студента (и предоставил имя, телефон и курс; если чего-то не хватает — вежливо уточни), вызывай инструмент \`book_student\`, чтобы добавить запись в Google Таблицу «Записи». По умолчанию записывай в группу до 12 человек (\`studyType: "group"\`), если пользователь не попросил индивидуальное занятие.
3. ВАЖНО: Контекст ниже синхронизируется с Google Диском в реальном времени. Если данные в истории переписки отличаются от свежего КОНТЕКСТА — всегда используй данные из свежего КОНТЕКСТА.
4. Отвечай дружелюбно, четко и структурированно.

--- RELEVANT KNOWLEDGE CONTEXT (LIVE SYNCED FROM GOOGLE DRIVE + VECTOR EMBEDDINGS) ---
${contextText}
--------------------------------------------------------------------------`;

    const ai = new GoogleGenAI({ apiKey });

    const contents: Content[] = [
      ...history.slice(-6).map((item) => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: item.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    let response = await generateWithRetry(ai, contents, systemInstruction);

    // Handle up to 3 rounds of Gemini Function Calling (find_free_slots / book_student)
    for (let step = 0; step < 3; step++) {
      const functionCalls = response.functionCalls;
      if (!functionCalls || functionCalls.length === 0) break;

      const modelContent = response.candidates?.[0]?.content;
      if (modelContent) {
        contents.push(modelContent);
      }

      const functionResponseParts = [];
      for (const call of functionCalls) {
        const args = (call.args || {}) as Record<string, string>;
        let toolOutput: unknown;

        try {
          if (call.name === 'find_free_slots') {
            const slots = await findFreeSlots({
              apiKey,
              date: args.date,
              teacher: args.teacher,
              studyType: args.studyType === 'individual' ? 'individual' : 'group',
            });
            toolOutput = { slots };
          } else if (call.name === 'book_student') {
            const booked = await bookStudentToSheet({
              studentName: args.studentName,
              phone: args.phone,
              course: args.course,
              teacher: args.teacher,
              date: args.date,
              timeSlot: args.timeSlot,
              format: args.format,
              studyType: args.studyType === 'individual' ? 'individual' : 'group',
              email: args.email,
              comment: args.comment,
            });
            toolOutput = {
              success: true,
              booking: booked.booking,
              groupSpotInfo: booked.groupSpotInfo,
            };
          } else {
            toolOutput = { error: `Неизвестный инструмент: ${call.name}` };
          }
        } catch (toolErr: unknown) {
          toolOutput = {
            success: false,
            error: toolErr instanceof Error ? toolErr.message : 'Ошибка выполнения инструмента',
          };
        }

        functionResponseParts.push({
          functionResponse: {
            name: call.name,
            response: { result: toolOutput },
          },
        });
      }

      contents.push({
        role: 'user',
        parts: functionResponseParts,
      });

      response = await generateWithRetry(ai, contents, systemInstruction);
    }

    const reply =
      response.text ||
      'Извините, не удалось сформировать ответ. Пожалуйста, повторите вопрос или свяжитесь с администратором.';

    const sources = Array.from(new Set(retrievedChunks.map((c) => c.source)));

    return NextResponse.json({
      reply,
      sources,
      retrievedChunks: retrievedChunks.map((c) => ({
        id: c.id,
        source: c.source,
        title: c.title,
        similarityPercent: c.similarityPercent,
      })),
      updatedSources: syncResult.updatedSources,
      syncedAt: syncResult.updatedAt,
      model: CHAT_MODEL,
      embeddingModel: getEmbeddingModelName(),
    });
  } catch (err: unknown) {
    console.error('Google Vector RAG Chat API error:', err);
    const errorMessage =
      err instanceof Error ? err.message : 'Внутренняя ошибка сервера при обращении к Gemini API';
    return NextResponse.json(
      { error: `Ошибка AI-ассистента: ${errorMessage}` },
      { status: 500 }
    );
  }
}
