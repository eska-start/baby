import { NextRequest, NextResponse } from "next/server";

const CHECKUP_PROMPT = `이 문서는 한국 영유아 건강검진 결과지 또는 성장 관련 문서입니다.
이미지/PDF 안의 텍스트를 읽고 다음 JSON 형식으로 정보를 추출해주세요. 값이 없으면 null로 표시하세요.
반드시 JSON만 응답하세요 (다른 텍스트 없이):
{
  "검진종류": "예: 영유아건강검진 5차",
  "검진일자": "YYYY-MM-DD 형식",
  "신장": 숫자(cm, 숫자만),
  "체중": 숫자(kg, 숫자만),
  "두위": 숫자(cm, 숫자만) 또는 null,
  "판정": "예: 양호/주의/이상"
}`;

const VACCINE_PROMPT = `이 문서는 한국 예방접종 기록 또는 증명서입니다.
이미지/PDF 안의 텍스트를 읽고 다음 JSON 형식으로 정보를 추출해주세요. 값이 없으면 null로 표시하세요.
반드시 JSON만 응답하세요 (다른 텍스트 없이):
{
  "백신명": "예: MMR",
  "차수": "예: 2차",
  "접종일": "YYYY-MM-DD 형식",
  "접종기관": "기관명 또는 null",
  "다음접종": "다음 권장 백신명 또는 null"
}`;

type ResponseContent = {
  type?: string;
  text?: string;
};

type ResponseOutput = {
  type?: string;
  content?: ResponseContent[];
};

type OpenAIResponse = {
  output_text?: string;
  output?: ResponseOutput[];
};

function collectText(data: OpenAIResponse): string {
  const chunks: string[] = [];
  if (data.output_text) chunks.push(data.output_text);

  for (const item of data.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string") chunks.push(content.text);
    }
  }

  return chunks.join("\n").trim();
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function hasMeaningfulValue(value: unknown) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY가 설정되지 않았어요." }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) ?? "checkup";

    if (!file) {
      return NextResponse.json({ error: "파일이 없어요." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const prompt = type === "checkup" ? CHECKUP_PROMPT : VACCINE_PROMPT;

    const content = isPdf
      ? [
          {
            type: "input_file",
            filename: file.name || "document.pdf",
            file_data: `data:application/pdf;base64,${base64}`,
          },
          { type: "input_text", text: prompt },
        ]
      : [
          {
            type: "input_image",
            image_url: `data:${file.type || "image/jpeg"};base64,${base64}`,
          },
          { type: "input_text", text: prompt },
        ];

    const apiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_output_tokens: 900,
        input: [{ role: "user", content }],
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("openai error", apiRes.status, errText);
      return NextResponse.json({ error: "AI 분석 API 호출에 실패했어요." }, { status: 502 });
    }

    const data = (await apiRes.json()) as OpenAIResponse;
    const raw = collectText(data);
    const extracted = parseJsonObject(raw) ?? {};
    const meaningful = Object.values(extracted).some(hasMeaningfulValue);

    if (!raw || !meaningful) {
      return NextResponse.json(
        {
          error: "문서에서 정보를 찾지 못했어요. 더 선명한 사진이나 텍스트가 포함된 PDF로 다시 시도해주세요.",
          raw,
          extracted,
          type,
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ extracted, type, raw });
  } catch (err) {
    console.error("analyze error", err);
    return NextResponse.json({ error: "분석 중 오류가 발생했어요." }, { status: 500 });
  }
}
