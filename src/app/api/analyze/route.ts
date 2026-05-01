import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const CHECKUP_PROMPT = `이 이미지는 한국 영유아 건강검진 결과지입니다.
다음 JSON 형식으로 정보를 추출해주세요. 값이 없으면 null로 표시하세요.
반드시 JSON만 응답하세요 (다른 텍스트 없이):
{
  "검진종류": "예: 영유아건강검진 5차",
  "검진일자": "YYYY-MM-DD 형식",
  "신장": 숫자(cm, 숫자만),
  "체중": 숫자(kg, 숫자만),
  "두위": 숫자(cm, 숫자만) 또는 null,
  "판정": "예: 양호/주의/이상"
}`;

const VACCINE_PROMPT = `이 이미지는 한국 예방접종 기록 또는 증명서입니다.
다음 JSON 형식으로 정보를 추출해주세요. 값이 없으면 null로 표시하세요.
반드시 JSON만 응답하세요 (다른 텍스트 없이):
{
  "백신명": "예: MMR",
  "차수": "예: 2차",
  "접종일": "YYYY-MM-DD 형식",
  "접종기관": "기관명 또는 null",
  "다음접종": "다음 권장 백신명 또는 null"
}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) ?? "checkup";

    if (!file) {
      return NextResponse.json({ error: "파일이 없어요." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const isPdf = file.type === "application/pdf";

    const prompt = type === "checkup" ? CHECKUP_PROMPT : VACCINE_PROMPT;

    let content: Anthropic.MessageParam["content"];

    if (isPdf) {
      content = [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        } as Anthropic.DocumentBlockParam,
        { type: "text", text: prompt },
      ];
    } else {
      const mediaType = (
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)
          ? file.type
          : "image/jpeg"
      ) as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

      content = [
        {
          type: "image",
          source: { type: "base64", media_type: mediaType, data: base64 },
        },
        { type: "text", text: prompt },
      ];
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";

    let extracted: Record<string, unknown> = {};
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        extracted = JSON.parse(match[0]);
      } catch {
        extracted = {};
      }
    }

    return NextResponse.json({ extracted, type });
  } catch (err) {
    console.error("analyze error", err);
    return NextResponse.json({ error: "분석 중 오류가 발생했어요." }, { status: 500 });
  }
}
