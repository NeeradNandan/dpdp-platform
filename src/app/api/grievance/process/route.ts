import { NextRequest, NextResponse } from "next/server";
import { classify } from "@/lib/grievance/classifier";
import { generateResponse } from "@/lib/grievance/responder";
import type { RequestType } from "@/lib/grievance/types";

const VALID_TYPES: RequestType[] = [
  "access", "correction", "erasure", "portability", "objection",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      data_principal_email,
      request_type,
      description,
      language = "en",
    } = body;

    if (!data_principal_email || typeof data_principal_email !== "string") {
      return NextResponse.json({ error: "data_principal_email is required" }, { status: 400 });
    }
    if (!description || typeof description !== "string") {
      return NextResponse.json({ error: "description is required" }, { status: 400 });
    }
    if (!request_type || !VALID_TYPES.includes(request_type)) {
      return NextResponse.json(
        { error: `request_type must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 },
      );
    }

    const classification = classify(description, request_type);
    const response = generateResponse(classification, {
      data_principal_email,
      request_type,
      description,
      language,
    });

    return NextResponse.json({ classification, response });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
