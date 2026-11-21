import crypto from 'crypto';
import * as XLSX from 'xlsx';
import { syncAndLoadKnowledgeBase } from './googleRagEngine';

export interface BookingRecord {
  id: string;
  createdAt: string;
  studentName: string;
  phone: string;
  email: string;
  course: string;
  teacher: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  format: string; // Офлайн | Онлайн
  status: string;
  comment: string;
}

export const GROUP_MAX_CAPACITY = 12;

export interface SlotDetail {
  time: string;
  bookedCount: number;
  maxCapacity: number;
  remainingSpots: number;
  available: boolean;
}

export interface FreeSlotResult {
  date: string;
  dayOfWeek: string;
  teacher: string;
  subjectInfo: string;
  studyType: 'group' | 'individual';
  maxGroupCapacity: number;
  availableTimes: string[];
  bookedTimes: string[];
  slotDetails: SlotDetail[];
}

const HEADERS = [
  'ID записи',
  'Дата заявки',
  'Имя ученика',
  'Телефон',
  'Email',
  'Курс',
  'Преподаватель',
  'Дата занятия',
  'Время',
  'Формат',
  'Статус',
  'Комментарий',
];

const DEFAULT_TIME_SLOTS = [
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

const DAY_NAMES_RU = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

const DAY_ABBR_MAP: Record<string, string[]> = {
  Понедельник: ['понедельник', 'пн'],
  Вторник: ['вторник', 'вт'],
  Среда: ['среда', 'ср'],
  Четверг: ['четверг', 'чт'],
  Пятница: ['пятница', 'пт'],
  Суббота: ['суббота', 'сб'],
  Воскресенье: ['воскресенье', 'вс'],
};

let cachedSheetsToken: { token: string; expiresAt: number } | null = null;

function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : trimmed;
}

function getBookingsSpreadsheetId(): string {
  const raw =
    process.env.GOOGLE_BOOKINGS_SHEET ||
    '1OuW1n2EqV3mH817YDJKuDFow3hBBkmwhv-NW7kHxMzE';
  return extractSpreadsheetId(raw);
}

async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!clientEmail || !rawKey) {
    throw new Error(
      'Не настроены GOOGLE_SERVICE_ACCOUNT_EMAIL и GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY в .env.local'
    );
  }

  const now = Math.floor(Date.now() / 1000);
  if (cachedSheetsToken && cachedSheetsToken.expiresAt > now + 60) {
    return cachedSheetsToken.token;
  }

  const privateKey = rawKey.replace(/\\n/g, '\n');
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url');

  const unsignedJwt = `${header}.${payload}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedJwt);
  const signature = signer.sign(privateKey, 'base64url');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsignedJwt}.${signature}`,
    }),
    cache: 'no-store',
  });

  if (!tokenRes.ok) {
    throw new Error(`Google OAuth2 Error (${tokenRes.status}): ${await tokenRes.text()}`);
  }

  const data = await tokenRes.json();
  cachedSheetsToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in || 3600),
  };
  return cachedSheetsToken.token;
}

async function getFirstSheetTitle(spreadsheetId: string, token: string): Promise<string> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Sheets Error (${res.status}): ${errText}`);
  }
  const data = await res.json();
  return data?.sheets?.[0]?.properties?.title || 'Лист1';
}

function rowsToBookings(rows: unknown[][]): BookingRecord[] {
  if (!rows || rows.length <= 1) return [];
  return rows
    .slice(1)
    .filter((row) => Array.isArray(row) && row.some((cell) => String(cell ?? '').trim() !== ''))
    .map((row) => ({
    id: String(row[0] || ''),
    createdAt: String(row[1] || ''),
    studentName: String(row[2] || ''),
    phone: String(row[3] || ''),
    email: String(row[4] || ''),
    course: String(row[5] || ''),
    teacher: String(row[6] || ''),
    date: String(row[7] || ''),
    timeSlot: String(row[8] || ''),
    format: String(row[9] || ''),
    status: String(row[10] || ''),
    comment: String(row[11] || ''),
  }));
}

/**
 * Reads all existing student bookings from the Google Sheet.
 * Falls back to Drive XLSX export if Sheets API is disabled (read-only fallback).
 */
export async function readBookings(): Promise<BookingRecord[]> {
  const spreadsheetId = getBookingsSpreadsheetId();
  const token = await getAccessToken();

  const sheetTitle = 'Лист1';
  const sheetsRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      `${sheetTitle}!A1:L1000`
    )}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );

  if (sheetsRes.ok) {
    const data = await sheetsRes.json();
    return rowsToBookings(data.values || []);
  }

  // Fallback: read via Drive export if Sheets API is not yet enabled
  const driveRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );
  if (!driveRes.ok) {
    throw new Error(`Ошибка чтения таблицы записей (${sheetsRes.status})`);
  }
  const buf = Buffer.from(await driveRes.arrayBuffer());
  const wb = XLSX.read(buf, { type: 'buffer' });
  const firstSheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1 });
  return rowsToBookings(rows);
}

function isIndividualBooking(formatStr: string): boolean {
  return formatStr.toLowerCase().includes('индивид');
}

/**
 * Appends a student booking to the Google Sheet.
 * Supports group learning (up to 12 students per slot) and individual lessons (1 student per slot).
 */
export async function bookStudentToSheet(input: {
  studentName: string;
  phone: string;
  email?: string;
  course: string;
  teacher?: string;
  date?: string;
  timeSlot?: string;
  format?: string;
  studyType?: 'group' | 'individual' | string;
  comment?: string;
}): Promise<{ booking: BookingRecord; groupSpotInfo?: string; sheetUrl: string }> {
  const spreadsheetId = getBookingsSpreadsheetId();
  const token = await getAccessToken();

  // Check if Sheets API is available; otherwise use Drive API v3 fallback
  let useDriveFallback = false;
  let sheetTitle = 'Лист1';
  let existingRows: unknown[][] = [];

  try {
    sheetTitle = await getFirstSheetTitle(spreadsheetId, token);
    const existingRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        `${sheetTitle}!A1:L1000`
      )}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    );
    if (!existingRes.ok) {
      if (existingRes.status === 403) {
        useDriveFallback = true;
      } else {
        throw new Error(
          `Google Sheets Read Error (${existingRes.status}): ${await existingRes.text()}`
        );
      }
    } else {
      const existingData = await existingRes.json();
      existingRows = existingData.values || [];
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('403') || msg.includes('SERVICE_DISABLED')) {
      useDriveFallback = true;
    } else {
      throw err;
    }
  }

  let workbook: XLSX.WorkBook | null = null;
  if (useDriveFallback) {
    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    );
    if (!driveRes.ok) {
      throw new Error(`Google Drive Export Error (${driveRes.status}): ${await driveRes.text()}`);
    }
    const buf = Buffer.from(await driveRes.arrayBuffer());
    workbook = XLSX.read(buf, { type: 'buffer' });
    sheetTitle = workbook.SheetNames[0] || 'Лист1';
    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetTitle], { header: 1 });
    existingRows = rawRows.filter(
      (row) => Array.isArray(row) && row.some((cell) => String(cell ?? '').trim() !== '')
    );
  }

  const bookings = rowsToBookings(existingRows);
  const teacherNorm = (input.teacher || 'Подберет куратор').trim();
  const dateNorm = (input.date || '').trim();
  const timeNorm = (input.timeSlot || '').trim();
  const isIndividual =
    input.studyType === 'individual' ||
    (typeof input.studyType === 'string' && input.studyType.toLowerCase().includes('индивид'));

  let groupSpotInfo: string | undefined;

  // Check slot capacity (12 for group, 1 for individual)
  if (input.teacher && dateNorm && timeNorm) {
    const slotBookings = bookings.filter(
      (b) =>
        b.status !== 'Отменено' &&
        teacherMatches(b.teacher, teacherNorm) &&
        b.date === dateNorm &&
        b.timeSlot === timeNorm
    );

    const hasIndividual = slotBookings.some((b) => isIndividualBooking(b.format));

    if (isIndividual) {
      if (slotBookings.length > 0) {
        throw new Error(
          `Слот ${dateNorm} в ${timeNorm} у преподавателя ${teacherNorm} уже занят (записано учеников: ${slotBookings.length}). Индивидуальное занятие невозможно, выберите другое время.`
        );
      }
    } else {
      if (hasIndividual) {
        throw new Error(
          `Слот ${dateNorm} в ${timeNorm} у преподавателя ${teacherNorm} занят индивидуальным занятием. Выберите другое время.`
        );
      }
      if (slotBookings.length >= GROUP_MAX_CAPACITY) {
        throw new Error(
          `Группа на ${dateNorm} в ${timeNorm} у преподавателя ${teacherNorm} уже полностью набрана (${GROUP_MAX_CAPACITY}/${GROUP_MAX_CAPACITY} мест). Выберите другое время.`
        );
      }
      groupSpotInfo = `Место ${slotBookings.length + 1} из ${GROUP_MAX_CAPACITY}`;
    }
  }

  const bookingId = `AURA-${Date.now().toString().slice(-6)}`;
  const nowStr = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });
  const baseFormat = input.format === 'online' || input.format === 'Онлайн' ? 'Онлайн' : 'Офлайн';
  const formatWithType = isIndividual
    ? `${baseFormat} (Индивидуально)`
    : `${baseFormat} (Группа до ${GROUP_MAX_CAPACITY} чел.)`;

  const booking: BookingRecord = {
    id: bookingId,
    createdAt: nowStr,
    studentName: input.studentName.trim(),
    phone: input.phone.trim(),
    email: (input.email || '').trim(),
    course: input.course.trim(),
    teacher: teacherNorm,
    date: dateNorm || 'По согласованию',
    timeSlot: timeNorm || 'По согласованию',
    format: formatWithType,
    status: 'Записан',
    comment: (input.comment || '').trim(),
  };

  const rowValues = [
    booking.id,
    booking.createdAt,
    booking.studentName,
    booking.phone,
    booking.email,
    booking.course,
    booking.teacher,
    booking.date,
    booking.timeSlot,
    booking.format,
    booking.status,
    booking.comment,
  ];

  if (useDriveFallback && workbook) {
    const updatedRows = existingRows.length === 0 ? [HEADERS, rowValues] : [...existingRows, rowValues];
    workbook.Sheets[sheetTitle] = XLSX.utils.aoa_to_sheet(updatedRows);
    const outBuf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const patchRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${spreadsheetId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        body: outBuf,
      }
    );
    if (!patchRes.ok) {
      throw new Error(`Google Drive Update Error (${patchRes.status}): ${await patchRes.text()}`);
    }
  } else {
    if (existingRows.length === 0) {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
          `${sheetTitle}!A1:L1`
        )}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: [HEADERS] }),
        }
      );
    }

    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        `${sheetTitle}!A:L`
      )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [rowValues] }),
      }
    );

    if (!appendRes.ok) {
      throw new Error(`Google Sheets Append Error (${appendRes.status}): ${await appendRes.text()}`);
    }
  }

  return {
    booking,
    groupSpotInfo,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

/**
 * Extracts teacher schedules from live RAG schedule.xlsx chunks
 */
async function getLiveTeachersFromSchedule(
  apiKey: string
): Promise<Array<{ name: string; text: string }>> {
  const syncRes = await syncAndLoadKnowledgeBase(apiKey);
  return syncRes.chunks
    .filter(
      (c) =>
        c.source === 'schedule.xlsx' &&
        c.text.startsWith('Преподаватель:')
    )
    .map((c) => {
      const firstLine = c.text.split('\n')[0];
      const name = firstLine.replace(/^Преподаватель:\s*/, '').replace(/\s*\(Лист:.*$/, '').trim();
      return { name, text: c.text };
    });
}

function teacherWorksOnDay(teacherText: string, dayRu: string): boolean {
  const lines = teacherText.split('\n');
  const abbrs = DAY_ABBR_MAP[dayRu] || [dayRu.toLowerCase()];

  for (const line of lines) {
    const lower = line.toLowerCase();
    const mentionsDay = abbrs.some((a) => lower.includes(a));
    if (mentionsDay) {
      if (
        lower.includes('выходной') ||
        lower.includes('неприемные') ||
        lower.includes('методические дни')
      ) {
        return false;
      }
      return true;
    }
  }
  return false;
}

function teacherMatches(bookingTeacher: string, scheduleTeacher: string): boolean {
  const bLower = bookingTeacher.trim().toLowerCase();
  const sLower = scheduleTeacher.trim().toLowerCase();
  if (!bLower || !sLower) return false;
  if (bLower.includes(sLower) || sLower.includes(bLower)) return true;

  const bTokens = bLower.split(/\s+/).filter((w) => w.length >= 3);
  const sTokens = sLower.split(/\s+/).filter((w) => w.length >= 3);
  if (bTokens.length === 0 || sTokens.length === 0) return false;

  // Match if at least the surname (or 2+ tokens, or all tokens of shorter name) match
  const matched = bTokens.filter((bt) => sTokens.some((st) => st.includes(bt) || bt.includes(st)));
  return matched.length >= Math.min(bTokens.length, 2) || (bTokens.length === 1 && matched.length === 1);
}

/**
 * Finds free time slots for teachers on a given date (or next 7 days if date omitted)
 */
export async function findFreeSlots(params: {
  apiKey: string;
  date?: string; // YYYY-MM-DD
  teacher?: string;
  studyType?: 'group' | 'individual';
}): Promise<FreeSlotResult[]> {
  const [teachers, bookings] = await Promise.all([
    getLiveTeachersFromSchedule(params.apiKey),
    readBookings(),
  ]);

  const studyType: 'group' | 'individual' =
    params.studyType === 'individual' ? 'individual' : 'group';
  const maxCapacity = studyType === 'individual' ? 1 : GROUP_MAX_CAPACITY;

  const filteredTeachers = params.teacher
    ? teachers.filter((t) => {
        const nameLower = t.name.toLowerCase();
        const queryTokens = params.teacher!
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length >= 2)
          .map((w) => (w.length > 4 ? w.slice(0, -2) : w.slice(0, -1) || w));
        return queryTokens.some((stem) => nameLower.includes(stem));
      })
    : teachers;

  const targetDates: string[] = [];
  if (params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date.trim())) {
    targetDates.push(params.date.trim());
  } else {
    const base = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      targetDates.push(d.toISOString().slice(0, 10));
    }
  }

  const results: FreeSlotResult[] = [];

  for (const dateStr of targetDates) {
    const dObj = new Date(`${dateStr}T12:00:00Z`);
    const dayOfWeek = DAY_NAMES_RU[dObj.getUTCDay()];

    for (const t of filteredTeachers) {
      if (!teacherWorksOnDay(t.text, dayOfWeek)) continue;

      const dayBookings = bookings.filter(
        (b) =>
          b.status !== 'Отменено' &&
          b.date === dateStr &&
          teacherMatches(b.teacher, t.name) &&
          b.timeSlot
      );

      const slotDetails: SlotDetail[] = DEFAULT_TIME_SLOTS.map((time) => {
        const slotBookings = dayBookings.filter((b) => b.timeSlot === time);
        const bookedCount = slotBookings.length;
        const hasIndividual = slotBookings.some((b) => isIndividualBooking(b.format));

        const available =
          studyType === 'individual'
            ? bookedCount === 0
            : !hasIndividual && bookedCount < GROUP_MAX_CAPACITY;

        const remainingSpots = available ? Math.max(0, maxCapacity - bookedCount) : 0;

        return {
          time,
          bookedCount,
          maxCapacity,
          remainingSpots,
          available,
        };
      });

      const availableTimes = slotDetails.filter((s) => s.available).map((s) => s.time);
      const bookedTimes = slotDetails.filter((s) => !s.available).map((s) => s.time);

      const subjectLine =
        t.text
          .split('\n')
          .find((l) => l.includes('Должность и предметы:'))
          ?.replace(/.*Должность и предметы:\s*/, '')
          .split('|')[0]
          .trim() || '';

      results.push({
        date: dateStr,
        dayOfWeek,
        teacher: t.name,
        subjectInfo: subjectLine,
        studyType,
        maxGroupCapacity: GROUP_MAX_CAPACITY,
        availableTimes,
        bookedTimes,
        slotDetails,
      });
    }
  }

  return results;
}
