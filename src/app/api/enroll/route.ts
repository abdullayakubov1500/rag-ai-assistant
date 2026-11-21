import { NextRequest, NextResponse } from 'next/server';
import { bookStudentToSheet, findFreeSlots } from '@/lib/googleSheetsBooking';

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY не задан' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || undefined;
    const teacher = searchParams.get('teacher') || undefined;
    const studyType =
      searchParams.get('studyType') === 'individual' ? 'individual' : 'group';

    const slots = await findFreeSlots({ apiKey, date, teacher, studyType });
    return NextResponse.json({ slots });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Ошибка получения свободных окон';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const studentName = (body?.name || body?.studentName || '').trim();
    const phone = (body?.phone || '').trim();
    const email = (body?.email || '').trim();
    const course = (body?.course || '').trim();
    const teacher = (body?.teacher || '').trim();
    const date = (body?.date || '').trim();
    const timeSlot = (body?.timeSlot || '').trim();
    const format = (body?.format || 'offline').trim();
    const studyType = (body?.studyType || 'group').trim();
    const comment = (body?.comment || '').trim();

    if (!studentName || !phone || !course) {
      return NextResponse.json(
        { error: 'Укажите имя ученика, телефон и курс.' },
        { status: 400 }
      );
    }

    const result = await bookStudentToSheet({
      studentName,
      phone,
      email,
      course,
      teacher,
      date,
      timeSlot,
      format,
      studyType,
      comment,
    });

    return NextResponse.json({
      status: 'ok',
      booking: result.booking,
      groupSpotInfo: result.groupSpotInfo,
      sheetUrl: result.sheetUrl,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Ошибка записи в Google Таблицу';
    const status = msg.includes('уже занят') ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
