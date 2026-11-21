import fs from 'fs';
import path from 'path';

export interface RagChunk {
  id: string;
  source: string;
  sourceTitle: string;
  section: string;
  content: string;
}

export interface RetrievalResult {
  chunks: RagChunk[];
  sources: string[];
}

const DOC_TITLES: Record<string, string> = {
  'price_list.md': 'Прайс-лист курсов',
  'faq.md': 'Часто задаваемые вопросы (FAQ)',
  'schedule.md': 'График работы и контакты',
};

// Simple Russian/English tokenizer with light suffix normalization for better recall
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .map((w) => (w.length > 5 ? w.slice(0, -2) : w.length > 4 ? w.slice(0, -1) : w));
}

// Synonym/intent expansion for common educational center queries
const QUERY_EXPANSIONS: Record<string, string[]> = {
  цен: ['стоим', 'прайс', 'сум', 'скольк', 'оплат', 'рассроч'],
  скольк: ['стоим', 'цен', 'сум', 'прайс'],
  стоим: ['цен', 'сум', 'прайс', 'рассроч'],
  оплат: ['рассроч', 'payme', 'click', 'uzcard', 'humo', 'карт'],
  рассроч: ['оплат', 'uzum', 'anorbank', 'част', 'процент'],
  запис: ['брон', 'пробн', 'урок', 'телефон', 'заявк'],
  перенес: ['отмен', 'пропуст', 'болезн', 'отработ', 'справк'],
  отмен: ['перенес', 'пропуст', 'болезн', 'отработ'],
  гарант: ['договор', 'качеств', 'бал', 'бесплатн'],
  взят: ['собой', 'перв', 'тетрад', 'ноутбук', 'подготов'],
  график: ['расписан', 'время', 'час', 'день', 'недел', 'работа'],
  расписан: ['график', 'время', 'час', 'понедел', 'вторн', 'сред', 'четверг', 'пятниц', 'суббот', 'воскрес'],
  адрес: ['метро', 'где', 'наход', 'локац', 'ташкент', 'ойбек'],
  контакт: ['телефон', 'telegram', 'instagram', 'whatsapp', 'почт', 'связ'],
};

let cachedChunks: RagChunk[] | null = null;

export function loadRagChunks(): RagChunk[] {
  if (cachedChunks) return cachedChunks;

  const ragDir = path.join(process.cwd(), 'docs', 'rag');
  if (!fs.existsSync(ragDir)) {
    return [];
  }

  const files = fs.readdirSync(ragDir).filter((f) => f.endsWith('.md'));
  const chunks: RagChunk[] = [];

  for (const file of files) {
    const filePath = path.join(ragDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const sourceTitle = DOC_TITLES[file] || file;

    // Split by ## or ### headings
    const sections = raw.split(/\n(?=##+ )/);

    sections.forEach((sec, idx) => {
      const trimmed = sec.trim();
      if (!trimmed) return;

      const firstLine = trimmed.split('\n')[0].replace(/^#+\s*/, '').trim();
      chunks.push({
        id: `${file}#${idx}`,
        source: file,
        sourceTitle,
        section: firstLine || sourceTitle,
        content: trimmed,
      });
    });
  }

  cachedChunks = chunks;
  return chunks;
}

export function retrieveContext(query: string, topK = 6): RetrievalResult {
  const chunks = loadRagChunks();
  if (chunks.length === 0) {
    return { chunks: [], sources: [] };
  }

  const baseTokens = tokenize(query);
  const expandedTokens = new Set<string>(baseTokens);

  for (const token of baseTokens) {
    for (const [key, synonyms] of Object.entries(QUERY_EXPANSIONS)) {
      if (token.startsWith(key) || key.startsWith(token)) {
        synonyms.forEach((s) => expandedTokens.add(s));
      }
    }
  }

  const scored = chunks.map((chunk) => {
    const hayLower = `${chunk.sourceTitle} ${chunk.section} ${chunk.content}`.toLowerCase();
    const hayTokens = tokenize(hayLower);
    const haySet = new Set(hayTokens);

    let score = 0;

    // Exact base token matches
    for (const t of baseTokens) {
      if (haySet.has(t)) score += 3;
      if (hayLower.includes(t)) score += 2;
      if (chunk.section.toLowerCase().includes(t)) score += 3;
    }

    // Expanded synonym matches
    for (const t of expandedTokens) {
      if (hayLower.includes(t)) score += 1;
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Take topK chunks with score > 0, or fallback to intro chunks from each doc
  let selected = scored.filter((s) => s.score > 0).slice(0, topK).map((s) => s.chunk);

  if (selected.length === 0) {
    selected = chunks.slice(0, Math.min(4, chunks.length));
  }

  const sources = Array.from(new Set(selected.map((c) => c.source)));
  return { chunks: selected, sources };
}
