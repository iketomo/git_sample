import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface User {
  id: string;
  name: string;
  address: string;
  hasWheelchair: boolean;
}

export interface RouteStep {
  order: number;
  userName: string;
  address: string;
  note?: string;
}

export interface OptimizationResult {
  route: RouteStep[];
  explanation: string;
  mapLinks: { title: string; uri: string }[];
}

export async function optimizeRoute(
  daycareAddress: string,
  users: User[],
  vehicleCapacity: number,
  wheelchairCapacity: number
): Promise<OptimizationResult> {
  const prompt = `
デイサービスの送迎ルートを最適化してください。

【拠点（デイサービス）の住所】
${daycareAddress}

【利用者リスト】
${users
  .map(
    (u) =>
      `- 名前: ${u.name}, 住所: ${u.address}, 車椅子: ${
        u.hasWheelchair ? "あり" : "なし"
      }`
  )
  .join("\n")}

【車両制限】
- 最大定員: ${vehicleCapacity}名
- 車椅子最大数: ${wheelchairCapacity}台

【依頼事項】
1. 拠点を出発し、全員をピックアップして拠点に戻るまでの最も効率的な順番を提案してください。
2. 道路状況や地理的な近さを考慮してください。
3. 車椅子の利用者がいる場合、乗降時間を考慮したアドバイスも含めてください。
4. 結果は、順番（1, 2, 3...）、氏名、住所のリスト形式で出力し、その後に理由を説明してください。
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
    },
  });

  const text = response.text || "ルートを生成できませんでした。";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const mapLinks = groundingChunks
    .filter((chunk: any) => chunk.maps)
    .map((chunk: any) => ({
      title: chunk.maps.title || "Google Mapsで見る",
      uri: chunk.maps.uri,
    }));

  // Simple parsing logic for the route steps (Gemini's output is markdown)
  // We'll return the full text and map links.
  return {
    route: [], // We'll rely on the text for now as parsing markdown is complex
    explanation: text,
    mapLinks: mapLinks,
  };
}
