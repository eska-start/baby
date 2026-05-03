import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import type { AnalysisResult } from '@/types/vaccination';

const SYSTEM_PROMPT = `너는 한국 아동 예방접종 기록 분석 전문가야.
사용자가 제공한 텍스트(수첩, 병원 기록, 메모 등)에서 예방접종과 건강검진 정보를 추출해.

반드시 JSON 형식으로만 응답해. 다른 텍스트 없이 JSON만.

{
  "birthDate": "YYYY-MM-DD 또는 null",
  "records": [
    {
      "name": "접종명 (예: DTaP 2차, BCG, 건강검진 4차)",
      "vaccineGroup": "그룹명 (예: DTaP, B형간염, 영유아검진)",
      "doseNumber": 1,
      "status": "completed",
      "completedDate": "YYYY-MM-DD 또는 null",
      "hospital": "병원명 또는 null",
      "confidence": "high | medium | low",
      "note": "불확실한 이유 또는 null"
    }
  ]
}

한국 국가필수예방접종 목록 (vaccineGroup 표준 이름):
BCG, B형간염, DTaP, 폴리오, Hib, PCV, MMR, 수두, A형간염, 일본뇌염, Td

건강검진 vaccineGroup: 영유아검진
건강검진 차수: 1차(생후1개월), 2차(2-3개월), 3차(4-5개월), 4차(9-12개월), 5차(18-24개월), 6차(30-36개월), 7차(42-48개월), 8차(54-60개월), 9차(66-71개월)

신뢰도 기준:
- high: 날짜와 접종명이 명확하게 기재된 경우
- medium: 접종명은 확실하나 날짜가 불명확한 경우
- low: 접종명이 불명확하거나 해석이 필요한 경우`;

export async function POST(req: NextRequest) {
  try {
    const { text, birthDate } = (await req.json()) as {
      text: string;
      birthDate?: string;
    };

    if (!text?.trim()) {
      return NextResponse.json({ error: '분석할 텍스트가 없습니다.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const client = new OpenAI({ apiKey });

    const userContent = birthDate
      ? `아이 생년월일: ${birthDate}\n\n--- 기록 내용 ---\n${text}`
      : text;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    });

    const raw = completion.choices[0].message.content ?? '{}';
    const result = JSON.parse(raw) as AnalysisResult;

    return NextResponse.json(result);
  } catch (err) {
    console.error('[vaccination/analyze]', err);
    const message = err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
