import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export interface KnowledgeChunk {
  id: string;
  source: string;
  title: string;
  text: string;
  vector?: number[];
}

export interface ScoredChunk extends KnowledgeChunk {
  similarity: number;
  similarityPercent: number;
}

export interface SourceMeta {
  fileId?: string;
  modifiedTime: string;
  version: string;
  syncedAt: string;
}

export interface RagIndexFile {
  embeddingModel: string;
  updatedAt: string;
  filesMeta: Record<string, SourceMeta>;
  chunks: KnowledgeChunk[];
}

export interface SyncResult {
  chunks: KnowledgeChunk[];
  updatedSources: string[];
  filesMeta: Record<string, SourceMeta>;
  updatedAt: string;
}

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
const RAG_INDEX_PATH = path.join(process.cwd(), 'docs', 'rag', 'rag_index.json');

// In-memory embedding cache keyed by model + taskType + exact chunk text
const vectorCache = new Map<string, number[]>();
let memoryIndex: { data: RagIndexFile; fileMtimeMs: number } | null = null;
let watcherStarted = false;

// Cached Google OAuth2 token for Service Account (valid ~1 hour)
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

/**
 * 1. Vector Math: Cosine Similarity
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 2. Generate Vector Embedding via Google AI Studio API
 */
export async function getEmbedding(
  text: string,
  taskType: 'RETRIEVAL_QUERY' | 'RETRIEVAL_DOCUMENT' | 'SEMANTIC_SIMILARITY' = 'RETRIEVAL_DOCUMENT',
  apiKey: string
): Promise<number[]> {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not defined.');
  const cacheKey = `${EMBEDDING_MODEL}:${taskType}:${text}`;
  const cached = vectorCache.get(cacheKey);
  if (cached) return cached;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
      taskType,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google AI Studio Embedding Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const vector = data?.embedding?.values;
  if (!vector || !Array.isArray(vector)) {
    throw new Error('Invalid embedding vector structure received from Google AI Studio.');
  }

  vectorCache.set(cacheKey, vector);
  return vector;
}

/**
 * Extract Google File/Document ID from either a full Google URL or raw ID
 */
function extractGoogleId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : trimmed;
}

/**
 * Obtain OAuth2 Access Token via Google Service Account (if configured)
 */
async function getGoogleDriveAccessToken(): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!clientEmail || !rawKey) return null;

  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60) {
    return cachedAccessToken.token;
  }

  const privateKey = rawKey.replace(/\\n/g, '\n');

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url');

  const unsignedJwt = `${header}.${payload}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedJwt);
  const signature = signer.sign(privateKey, 'base64url');
  const assertion = `${unsignedJwt}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Google OAuth2 Token Error (${tokenRes.status}): ${errText}`);
  }

  const tokenData = await tokenRes.json();
  cachedAccessToken = {
    token: tokenData.access_token,
    expiresAt: now + (tokenData.expires_in || 3600),
  };
  return cachedAccessToken.token;
}

interface DriveFileMeta {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  version: string;
}

async function getDriveFileMetadata(
  fileId: string,
  accessToken: string
): Promise<DriveFileMeta> {
  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,modifiedTime,version`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    }
  );

  if (!metaRes.ok) {
    const errText = await metaRes.text();
    throw new Error(`Google Drive Metadata Error (${metaRes.status}): ${errText}`);
  }

  return metaRes.json();
}

async function downloadDriveFileBuffer(
  fileId: string,
  mimeType: string,
  accessToken: string
): Promise<Buffer> {
  let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  if (mimeType === 'application/vnd.google-apps.document') {
    downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
  } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
  }

  const fileRes = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!fileRes.ok) {
    const errText = await fileRes.text();
    throw new Error(`Google Drive Download Error (${fileRes.status}): ${errText}`);
  }

  return Buffer.from(await fileRes.arrayBuffer());
}

async function fetchPublicGoogleBuffer(
  idOrUrl: string,
  expectedType: 'docx' | 'xlsx'
): Promise<Buffer> {
  const fileId = extractGoogleId(idOrUrl);
  let publicUrl: string;
  if (idOrUrl.includes('docs.google.com/document')) {
    publicUrl = `https://docs.google.com/document/d/${fileId}/export?format=docx`;
  } else if (idOrUrl.includes('docs.google.com/spreadsheets')) {
    publicUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
  } else if (expectedType === 'docx') {
    publicUrl = `https://docs.google.com/document/d/${fileId}/export?format=docx`;
  } else {
    publicUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
  }

  let res = await fetch(publicUrl, { cache: 'no-store' });
  if (!res.ok) {
    res = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`, {
      cache: 'no-store',
    });
  }

  if (!res.ok) {
    throw new Error(
      `Не удалось скачать файл (${fileId}) из Google. Проверьте права доступа или настройки Service Account.`
    );
  }

  return Buffer.from(await res.arrayBuffer());
}

/**
 * Split plain text from DOCX into ~300–1400 char semantic chunks
 */
function chunkDocxText(rawText: string, source: string, docTitle: string): KnowledgeChunk[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const chunks: KnowledgeChunk[] = [];
  let buffer: string[] = [];
  let currentLength = 0;
  let chunkIdx = 0;

  const isSectionHeading = (line: string) =>
    /^(?:\d+\.\s+|Вопрос\s+\d+|Важные условия)/i.test(line) && line.length < 140;

  for (const line of lines) {
    if (isSectionHeading(line) && buffer.length > 0 && currentLength >= 250) {
      chunks.push({
        id: `${source}#${chunkIdx++}`,
        source,
        title: `${docTitle}: ${buffer[0].slice(0, 70)}`,
        text: buffer.join('\n'),
      });
      buffer = [line];
      currentLength = line.length;
    } else if (currentLength + line.length > 1300 && buffer.length > 0) {
      chunks.push({
        id: `${source}#${chunkIdx++}`,
        source,
        title: `${docTitle}: ${buffer[0].slice(0, 70)}`,
        text: buffer.join('\n'),
      });
      buffer = [line];
      currentLength = line.length;
    } else {
      buffer.push(line);
      currentLength += line.length + 1;
    }
  }

  if (buffer.length > 0) {
    chunks.push({
      id: `${source}#${chunkIdx}`,
      source,
      title: `${docTitle}: ${buffer[0].slice(0, 70)}`,
      text: buffer.join('\n'),
    });
  }

  return chunks;
}

/**
 * Parse XLSX Buffer (all sheets) into semantic KnowledgeChunks
 */
function parseXlsxBuffer(buffer: Buffer, source: string, docTitle: string): KnowledgeChunk[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const chunks: KnowledgeChunk[] = [];
  let chunkIdx = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    if (rows.length === 0) continue;

    const firstRowKeys = Object.keys(rows[0]);
    const teacherKey = firstRowKeys.find((k) => /преподават|учител|teacher/i.test(k));

    if (teacherKey) {
      const byTeacher = new Map<string, Record<string, unknown>[]>();
      for (const row of rows) {
        const name = String(row[teacherKey] || '').trim();
        if (!name) continue;
        const list = byTeacher.get(name) || [];
        list.push(row);
        byTeacher.set(name, list);
      }

      // 1. Summary chunk with ALL teachers
      const summaryLines: string[] = [
        `Полный список всех преподавателей (${byTeacher.size} чел.) из таблицы "${sheetName}":`,
      ];
      let num = 1;
      for (const [name, tRows] of byTeacher.entries()) {
        const roleKey = firstRowKeys.find((k) => /должн|предмет|subject|role/i.test(k));
        const dayKey = firstRowKeys.find((k) => /день|day/i.test(k));
        const role = roleKey ? String(tRows[0][roleKey] || '') : '';
        const days = dayKey
          ? tRows
              .map((r) => String(r[dayKey] || '').trim())
              .filter(Boolean)
              .join(', ')
          : '';
        summaryLines.push(
          `${num++}. ${name}${role ? ` — ${role}` : ''}${days ? ` (Дни: ${days})` : ''}`
        );
      }

      chunks.push({
        id: `${source}#${chunkIdx++}`,
        source,
        title: `${docTitle}: Список всех преподавателей`,
        text: summaryLines.join('\n'),
      });

      // 2. Individual detailed chunk per teacher
      for (const [name, tRows] of byTeacher.entries()) {
        const lines: string[] = [`Преподаватель: ${name} (Лист: ${sheetName})`];
        for (const row of tRows) {
          const rowText = firstRowKeys
            .filter((k) => k !== teacherKey && String(row[k] || '').trim() !== '')
            .map((k) => `${k}: ${String(row[k]).trim()}`)
            .join(' | ');
          if (rowText) lines.push(`- ${rowText}`);
        }
        chunks.push({
          id: `${source}#${chunkIdx++}`,
          source,
          title: `${docTitle}: ${name}`,
          text: lines.join('\n'),
        });
      }
    } else {
      const lines: string[] = [`Таблица "${sheetName}":`];
      for (const row of rows) {
        const rowText = firstRowKeys
          .filter((k) => String(row[k] || '').trim() !== '')
          .map((k) => `${k}: ${String(row[k]).trim()}`)
          .join(' | ');
        if (rowText) lines.push(`- ${rowText}`);
      }
      chunks.push({
        id: `${source}#${chunkIdx++}`,
        source,
        title: `${docTitle}: ${sheetName}`,
        text: lines.join('\n'),
      });
    }
  }

  return chunks;
}

function readPersistedIndex(): RagIndexFile | null {
  if (fs.existsSync(RAG_INDEX_PATH)) {
    try {
      const stat = fs.statSync(RAG_INDEX_PATH);
      if (
        memoryIndex &&
        memoryIndex.fileMtimeMs === stat.mtimeMs &&
        memoryIndex.data.embeddingModel === EMBEDDING_MODEL
      ) {
        return memoryIndex.data;
      }

      const parsed = JSON.parse(fs.readFileSync(RAG_INDEX_PATH, 'utf-8')) as RagIndexFile;
      if (parsed && parsed.embeddingModel === EMBEDDING_MODEL && Array.isArray(parsed.chunks)) {
        // Hydrate vectorCache from persisted index
        for (const chunk of parsed.chunks) {
          if (Array.isArray(chunk.vector)) {
            vectorCache.set(`${EMBEDDING_MODEL}:RETRIEVAL_DOCUMENT:${chunk.text}`, chunk.vector);
          }
        }
        memoryIndex = { data: parsed, fileMtimeMs: stat.mtimeMs };
        return parsed;
      }
    } catch {
      return null;
    }
  }
  return memoryIndex?.data || null;
}

function writePersistedIndex(indexData: RagIndexFile) {
  try {
    fs.mkdirSync(path.dirname(RAG_INDEX_PATH), { recursive: true });
    fs.writeFileSync(RAG_INDEX_PATH, JSON.stringify(indexData, null, 2), 'utf-8');
    const stat = fs.statSync(RAG_INDEX_PATH);
    memoryIndex = { data: indexData, fileMtimeMs: stat.mtimeMs };
  } catch (err) {
    console.warn('[Google RAG] Could not persist rag_index.json:', err);
    memoryIndex = { data: indexData, fileMtimeMs: Date.now() };
  }
}

/**
 * Background watcher that checks Google Drive modifiedTime every 15 seconds.
 * Whenever any source file changes, it immediately regenerates RAG chunks & embeddings.
 */
export function startDriveWatcher(apiKey: string, intervalMs = 15000) {
  if (watcherStarted || !apiKey) return;
  watcherStarted = true;

  const timer = setInterval(async () => {
    try {
      const res = await syncAndLoadKnowledgeBase(apiKey, false);
      if (res.updatedSources.length > 0) {
        console.log(
          `[Google RAG Watcher] Обнаружено изменение файлов (${res.updatedSources.join(', ')}) — RAG данные пересозданы (${res.chunks.length} чанков).`
        );
      }
    } catch (err) {
      console.warn('[Google RAG Watcher] Ошибка фоновой проверки:', err);
    }
  }, intervalMs);

  // Do not prevent Node process from exiting cleanly
  if (typeof timer.unref === 'function') {
    timer.unref();
  }
}

/**
 * Checks Google Drive modifiedTime/version for all configured files.
 * Whenever ANY source file changes on Google Drive, automatically downloads it,
 * rebuilds its chunks & vector embeddings, and saves fresh RAG data to docs/rag/rag_index.json.
 */
export async function syncAndLoadKnowledgeBase(
  apiKey: string,
  forceSync = false
): Promise<SyncResult> {
  startDriveWatcher(apiKey);
  const ragDir = path.join(process.cwd(), 'docs', 'rag');
  const existingIndex = readPersistedIndex();
  const accessToken = await getGoogleDriveAccessToken();

  const sourcesConfig = [
    {
      envVar: process.env.GOOGLE_PRICE_LIST_DOC,
      localFile: 'price_list.docx',
      sourceKey: 'price_list.docx',
      title: 'Прайс-лист курсов',
      type: 'docx' as const,
    },
    {
      envVar: process.env.GOOGLE_FAQ_DOC,
      localFile: 'faq.docx',
      sourceKey: 'faq.docx',
      title: 'Часто задаваемые вопросы (FAQ)',
      type: 'docx' as const,
    },
    {
      envVar: process.env.GOOGLE_SCHEDULE_SHEET,
      localFile: 'schedule.xlsx',
      sourceKey: 'schedule.xlsx',
      title: 'График работы и контакты (Excel)',
      type: 'xlsx' as const,
    },
  ];

  const updatedSources: string[] = [];
  const nextFilesMeta: Record<string, SourceMeta> = { ...(existingIndex?.filesMeta || {}) };
  const chunksBySource = new Map<string, KnowledgeChunk[]>();

  // Pre-fill chunksBySource from existing index
  if (existingIndex && !forceSync) {
    for (const c of existingIndex.chunks) {
      const arr = chunksBySource.get(c.source) || [];
      arr.push(c);
      chunksBySource.set(c.source, arr);
    }
  }

  await Promise.all(
    sourcesConfig.map(async (cfg) => {
      const prevMeta = existingIndex?.filesMeta?.[cfg.sourceKey];
      const hasCachedChunks = (chunksBySource.get(cfg.sourceKey)?.length || 0) > 0;
      let buffer: Buffer | null = null;
      let newMeta: SourceMeta | null = null;

      if (cfg.envVar && cfg.envVar.trim()) {
        const fileId = extractGoogleId(cfg.envVar);

        if (accessToken) {
          const driveMeta = await getDriveFileMetadata(fileId, accessToken);
          const isChanged =
            forceSync ||
            !hasCachedChunks ||
            !prevMeta ||
            prevMeta.modifiedTime !== driveMeta.modifiedTime ||
            prevMeta.version !== String(driveMeta.version);

          if (!isChanged) {
            return; // File unchanged on Google Drive — keep cached chunks & vectors!
          }

          buffer = await downloadDriveFileBuffer(fileId, driveMeta.mimeType, accessToken);
          newMeta = {
            fileId,
            modifiedTime: driveMeta.modifiedTime,
            version: String(driveMeta.version),
            syncedAt: new Date().toISOString(),
          };
        } else {
          // Public link mode: always fetch fresh buffer and compare hash
          buffer = await fetchPublicGoogleBuffer(cfg.envVar, cfg.type);
          const hash = crypto.createHash('sha256').update(buffer).digest('hex');
          if (!forceSync && hasCachedChunks && prevMeta?.version === hash) {
            return;
          }
          newMeta = {
            fileId,
            modifiedTime: new Date().toISOString(),
            version: hash,
            syncedAt: new Date().toISOString(),
          };
        }
      } else {
        // Local file fallback: check mtimeMs
        const localPath = path.join(ragDir, cfg.localFile);
        if (!fs.existsSync(localPath)) return;
        const stat = fs.statSync(localPath);
        const mtimeStr = stat.mtime.toISOString();
        if (!forceSync && hasCachedChunks && prevMeta?.modifiedTime === mtimeStr) {
          return;
        }
        buffer = fs.readFileSync(localPath);
        newMeta = {
          modifiedTime: mtimeStr,
          version: String(stat.size),
          syncedAt: new Date().toISOString(),
        };
      }

      if (!buffer || !newMeta) return;

      const parsedChunks =
        cfg.type === 'docx'
          ? chunkDocxText((await mammoth.extractRawText({ buffer })).value, cfg.sourceKey, cfg.title)
          : parseXlsxBuffer(buffer, cfg.sourceKey, cfg.title);

      await indexKnowledgeChunks(parsedChunks, apiKey);

      chunksBySource.set(cfg.sourceKey, parsedChunks);
      nextFilesMeta[cfg.sourceKey] = newMeta;
      updatedSources.push(cfg.sourceKey);
    })
  );

  const allChunks = sourcesConfig.flatMap((cfg) => chunksBySource.get(cfg.sourceKey) || []);
  await indexKnowledgeChunks(allChunks, apiKey);

  const updatedAt =
    updatedSources.length > 0 || !existingIndex
      ? new Date().toISOString()
      : existingIndex.updatedAt;

  if (updatedSources.length > 0 || !existingIndex) {
    writePersistedIndex({
      embeddingModel: EMBEDDING_MODEL,
      updatedAt,
      filesMeta: nextFilesMeta,
      chunks: allChunks,
    });
  }

  return {
    chunks: allChunks,
    updatedSources,
    filesMeta: nextFilesMeta,
    updatedAt,
  };
}

/**
 * 3. Batch Embed Knowledge Base Chunks (Precomputes & Caches Vectors)
 */
export async function indexKnowledgeChunks(
  chunks: KnowledgeChunk[],
  apiKey: string
): Promise<KnowledgeChunk[]> {
  const missing = chunks.filter((c) => !Array.isArray(c.vector));
  if (missing.length === 0) return chunks;

  const BATCH_SIZE = 10;
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (chunk) => {
        chunk.vector = await getEmbedding(chunk.text, 'RETRIEVAL_DOCUMENT', apiKey);
      })
    );
  }
  return chunks;
}

/**
 * 4. Retrieve Top-K Most Relevant Chunks by Cosine Similarity
 */
export async function retrieveRelevantChunks(
  userQuery: string,
  chunks: KnowledgeChunk[],
  apiKey: string,
  topK = 8
): Promise<ScoredChunk[]> {
  const queryVector = await getEmbedding(userQuery, 'RETRIEVAL_QUERY', apiKey);

  const scored: ScoredChunk[] = chunks
    .filter((c): c is KnowledgeChunk & { vector: number[] } => Array.isArray(c.vector))
    .map((chunk) => {
      const similarity = cosineSimilarity(queryVector, chunk.vector);
      return {
        ...chunk,
        similarity,
        similarityPercent: Math.round(similarity * 100),
      };
    });

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}

export function getEmbeddingModelName(): string {
  return EMBEDDING_MODEL;
}
