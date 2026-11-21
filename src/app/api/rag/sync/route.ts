import { NextRequest, NextResponse } from 'next/server';
import { syncAndLoadKnowledgeBase, getEmbeddingModelName } from '@/lib/googleRagEngine';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY не задан в .env.local' },
        { status: 500 }
      );
    }

    let force = false;
    try {
      const body = await req.json();
      force = Boolean(body?.force);
    } catch {
      // empty body is fine
    }

    const result = await syncAndLoadKnowledgeBase(apiKey, force);

    return NextResponse.json({
      status: 'ok',
      totalChunks: result.chunks.length,
      updatedSources: result.updatedSources,
      filesMeta: result.filesMeta,
      updatedAt: result.updatedAt,
      embeddingModel: getEmbeddingModelName(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Ошибка синхронизации RAG';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
