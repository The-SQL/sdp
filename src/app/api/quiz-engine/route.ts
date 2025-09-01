import { SYSTEM_PROMPT } from "@/utils/ai/prompts";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  const VALID_API_KEY = process.env.QUIZ_ENGINE_API_KEY_PUBLIC;

  if (!apiKey || apiKey !== VALID_API_KEY) {
    return NextResponse.json(
      { message: "Unauthorized: Invalid or missing API key" },
      { status: 401 }
    );
  }

  const { data } = await req.json();

  if (
    !data.topic ||
    !data.skill_level ||
    !data.number_of_questions ||
    !data.additional_instructions
  ) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  const client = new OpenAI();

  try {
    const response = await client.responses.create({
      model: "gpt-4.1",
      instructions: SYSTEM_PROMPT,
      input: `${JSON.stringify({
        topic: data.topic,
        skill_level: data.skill_level,
        number_of_questions: data.number_of_questions,
        additional_instructions: data.additional_instructions,
        question_type: "multiple_choice",
        information_from_sources: data.information_from_sources ?? "",
      })}`,
    });

    const jsonResponse = JSON.parse(response.output_text);
    return NextResponse.json(
      { message: "Exercise generated successfully", data: jsonResponse },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating exercise:", error);
    return NextResponse.json(
      { message: `Failed to generate exercise: ${error}` },
      { status: 500 }
    );
  }
}
